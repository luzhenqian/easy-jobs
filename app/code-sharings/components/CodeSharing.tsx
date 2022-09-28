import { useEffect, useRef, useState } from "react"
import { Routes, useParam } from "@blitzjs/next"
import Head from "next/head"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import { Button, Input, useToast } from "@chakra-ui/react"
import Editor, { loader } from "@monaco-editor/react"
import Loading from "app/core/components/Loading"
import { useLocalStorage } from "app/core/hooks/useLocalStorage"
import createCodeSharing from "app/code-sharings/mutations/createCodeSharing"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { ArrowDown, ArrowUp, Link as LinkIcon } from "app/core/components/Icons"
import useCopyToClipboard from "app/core/hooks/useCopyToClipboard"
import getCodeSharings from "../queries/getCodeSharings"
import Link from "next/link"

loader.config({
  paths: {
    vs: "/libs/monaco-editor@0.33.0",
  },
})

type Lang = "html" | "css" | "javascript"
type Codes = {
  html: string
  css: string
  javascript: string
}

const CodeSharing = () => {
  const [createCodeSharingMutation] = useMutation(createCodeSharing)

  const user = useCurrentUser()
  const codeSharingId = useParam("codeSharingId", "string") || ""

  const [lang, setLang] = useState<Lang>("html")
  const [codes, setCodes] = useLocalStorage<Codes>("codes", {
    html: "",
    css: "",
    javascript: "",
  })

  const editorRef = useRef<any>()
  const canvasRef = useRef<HTMLIFrameElement | null>(null)
  const onMount = (editor) => {
    editorRef.current = editor
    editorRef.current.setValue(codes[lang])
  }

  const logEditorRef = useRef<any>()
  const onLogMount = (editor) => {
    logEditorRef.current = editor
  }
  const onChange = (value) => {
    setCodes((prev) => ({ ...prev, [lang]: value }))
  }

  const router = useRouter()
  const [sharing, setSharing] = useState(false)
  const toast = useToast()
  const [shareNameInputting, setShareNameInputting] = useState(false)
  const [shareName, setShareName] = useState("")
  const handleShareNameChange = (event) => setShareName(event.target.value)
  const sharedStepFirst = async () => {
    if (!user) {
      toast({
        status: "warning",
        title: "分享代码需要登录！",
        duration: 2000,
        position: "top",
      })
      return
    }
    setShareNameInputting(true)
  }
  const sharedStepSecond = async () => {
    setSharing(true)
    const { recordId } = await createCodeSharingMutation({
      code: codes,
      userId: user?.recordId || "",
      name: shareName,
    })
    setSharing(false)
    await router.push(Routes.CodeSharingHashPage({ codeSharingId: recordId }))
    toast({
      status: "success",
      title: "分享成功！",
      duration: 2000,
      position: "top",
    })
    setShareNameInputting(false)
  }

  const [{ codeSharings, count }] = useQuery(
    getCodeSharings,
    {
      where: {
        recordId: {
          equals: codeSharingId,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1,
      skip: 0,
    },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )

  codeSharingId && count === 0 && router.replace("/404")

  const [_, copy] = useCopyToClipboard()

  const [logs, setLogs] = useState<{ type: "log" | "error" | "info"; args: any }[]>([])
  useEffect(() => {
    function onMessage(e) {
      if (((e.data.type as string) || "").includes("console")) {
        setLogs((prev) => [...prev, e.data])
      }
    }

    window.addEventListener("message", onMessage)

    if (codeSharingId) setCodes(((codeSharings as unknown as any)[0] as any).code)

    if (canvasRef.current) {
      canvasRef.current.srcdoc = `${preInsertScript}${codes.html}<style>${codes.css}</style><script>${codes.javascript}</script>`
    }
    return () => {
      window.removeEventListener("message", onMessage)
    }
  }, [])

  useEffect(() => {
    if (editorRef.current) editorRef.current.setValue(codes[lang])
  }, [lang])

  const [consoleOpen, setConsoleOpen] = useState(false)
  useEffect(() => {
    setLogs([])
  }, [codes])
  useEffect(() => {
    let timer: any = null
    if (consoleOpen === true) {
      timer = setInterval(() => {
        if (logEditorRef.current) {
          logEditorRef.current.setValue(logs.map((log) => log.args).join("\n"))
          timer && clearInterval(timer)
        }
      }, 5_0)
    }
    return () => timer && clearInterval(timer)
  }, [logs, consoleOpen])

  return (
    <Layout
      headerStyle={{
        height: "40px",
        maxWidth: "100%",
      }}
      actions={
        <div className="flex items-center justify-between flex-1 px-8">
          <div className="flex items-center justify-center gap-4">
            {shareNameInputting ? (
              <Input
                size={"sm"}
                width={"140px"}
                maxLength={8}
                placeholder="请输入分享的代码名称"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void sharedStepSecond()
                  }
                }}
                onChange={handleShareNameChange}
                value={shareName}
              ></Input>
            ) : codeSharingId !== "" && codeSharings.length > 0 ? (
              <span className="text-sm">{codeSharings[0]!.name}</span>
            ) : null}
            <Button
              backgroundColor={"blue.500"}
              textColor={"white"}
              onClick={() => {
                if (shareNameInputting) {
                  return void sharedStepSecond()
                }
                void sharedStepFirst()
              }}
              isLoading={sharing}
              disabled={shareNameInputting && shareName === ""}
              size={"sm"}
            >
              分享
            </Button>

            {codeSharingId && (
              <span
                className="flex items-center text-sm"
                onClick={async () => {
                  await copy(location.href)
                  toast({
                    status: "success",
                    title: "复制成功！",
                    duration: 2000,
                    position: "top",
                  })
                }}
              >
                <LinkIcon className="w-8 h-8"></LinkIcon>
                <span> {codeSharingId}</span>
              </span>
            )}
          </div>
          <div>
            <Link href={Routes.MyCodeSharings()}>
              <Button
                backgroundColor={"blue.500"}
                textColor={"white"}
                isLoading={sharing}
                size={"sm"}
              >
                我的分享
              </Button>
            </Link>
          </div>
        </div>
      }
    >
      <Head>
        <title>CodeSharing</title>
      </Head>

      <div
        className="flex "
        style={{
          height: "calc(100vh - 40px)",
        }}
      >
        <div className="flex flex-col w-1/2">
          <div className="flex gap-3 px-8 py-2 text-gray-100 bg-gray-900">
            <span
              className={`${lang === "html" ? "text-blue-500" : ""} cursor-pointer`}
              onClick={setLang.bind(null, "html")}
            >
              HTML
            </span>
            <span
              className={`${lang === "css" ? "text-blue-500" : ""} cursor-pointer`}
              onClick={setLang.bind(null, "css")}
            >
              CSS
            </span>
            <span
              className={`${lang === "javascript" ? "text-blue-500" : ""} cursor-pointer`}
              onClick={() => setLang("javascript")}
            >
              JavaScript
            </span>
          </div>
          <div className="flex-1">
            <Editor
              loading={<Loading />}
              theme="vs-dark"
              language={lang}
              onMount={onMount}
              onChange={onChange}
            ></Editor>
          </div>
        </div>
        <div className="flex flex-col w-1/2">
          <iframe
            className="flex-1 w-full"
            ref={canvasRef}
            srcDoc={`
            ${preInsertScript}
            ${codes.html}<style>${codes.css}</style><script>${codes.javascript}</script>`}
          ></iframe>
          <div className="text-gray-100 bg-black border-t-2 border-gray-100 rounded-t-md">
            <div className="flex justify-between items-center px-4 h-[40px]">
              <div>控制台</div>
              {consoleOpen ? (
                <ArrowDown
                  size={"lg"}
                  className="fill-white"
                  onClick={() => setConsoleOpen(false)}
                />
              ) : (
                <ArrowUp size={"lg"} className="fill-white" onClick={() => setConsoleOpen(true)} />
              )}
            </div>
            {consoleOpen ? (
              <div className="border-t border-gray-400 h-[300px]">
                <div></div>
                <Editor theme="vs-dark" onMount={onLogMount} options={{ readOnly: true }}></Editor>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  )
}

const preInsertScript = `<script>
var fns = new Map()
for(let key in console) {
  fns.set(key, console[key])
  console[key] = (...args) => {
    window.parent.postMessage({ type: 'console.' + key, args }, "*")
    return fns.get(key)(...args)
  }
}
</script>`

export default CodeSharing
