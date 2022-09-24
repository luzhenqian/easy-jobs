import { useEffect, useRef, useState } from "react"
import { Routes, useParam } from "@blitzjs/next"
import Head from "next/head"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import { Alert, AlertIcon, Button, calc } from "@chakra-ui/react"
import Editor from "@monaco-editor/react"
import Loading from "app/core/components/Loading"
import { useLocalStorage } from "app/core/hooks/useLocalStorage"
import createCodeSharing from "app/code-sharings/mutations/createCodeSharing"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { ArrowDown, ArrowUp, Link } from "app/core/components/Icons"
import useCopyToClipboard from "app/core/hooks/useCopyToClipboard"
import getCodeSharings from "../queries/getCodeSharings"
import { offset, useFloating } from "@floating-ui/react-dom"

type Lang = "html" | "css" | "js"
type Codes = {
  html: string
  css: string
  js: string
}

const CodeSharing = () => {
  const [createCodeSharingMutation] = useMutation(createCodeSharing)

  const user = useCurrentUser()
  const codeSharingId = useParam("codeSharingId", "string")

  const [lang, setLang] = useState<Lang>("html")
  const [codes, setCodes] = useLocalStorage<Codes>("codes", {
    html: "",
    css: "",
    js: "",
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
  useEffect(() => {
    if (editorRef.current) editorRef.current.setValue(codes[lang])
  }, [lang])

  const router = useRouter()
  const [sharing, setSharing] = useState(false)
  const shared = async () => {
    setSharing(true)
    const { recordId } = await createCodeSharingMutation({
      code: codes,
      userId: user?.recordId || "",
    })
    setSharing(false)
    void router.push(Routes.CodeSharingHashPage({ codeSharingId: recordId }))
  }

  const [{ codeSharings, count }] = useQuery(
    getCodeSharings,
    { where: { recordId: codeSharingId }, orderBy: { createdAt: "desc" }, take: 1, skip: 0 },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  codeSharingId && count === 0 && router.replace("/404")

  const [_, copy] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  const { x, y, reference, floating, strategy } = useFloating({
    placement: "top",
    middleware: [offset(-60)],
  })

  const [logs, setLogs] = useState<{ type: "log" | "error" | "info"; args: any }[]>([])
  useEffect(() => {
    if (typeof window !== "undefined") reference(document.body)
    function onMessage(e) {
      if (((e.data.type as string) || "").includes("console")) {
        console.log("e", e.data)
        setLogs((prev) => [...prev, e.data])
      }
    }
    window.addEventListener("message", onMessage)

    if (codeSharingId) setCodes((codeSharings[0] as any).code)

    if (canvasRef.current)
      canvasRef.current.srcdoc = `${codes.html}<style>${codes.css}</style><script>${codes.js}</script>`
    return () => {
      window.removeEventListener("message", onMessage)
    }
  }, [])

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
      }}
      actions={
        <div className="flex-1 flex px-8">
          <div className="flex gap-4">
            <Button
              backgroundColor={"blue.500"}
              textColor={"white"}
              onClick={shared}
              isLoading={sharing}
              size={"sm"}
            >
              分享
            </Button>

            {codeSharingId && (
              <span
                className="text-sm flex items-center"
                onClick={async () => {
                  await copy(location.href)
                  setCopied(true)
                  setTimeout(() => {
                    setCopied(false)
                  }, 15_00)
                }}
              >
                <Link className="w-8 h-8"></Link>
                <span> {codeSharingId}</span>
              </span>
            )}
          </div>
          <div></div>
        </div>
      }
    >
      <Head>
        <title>CodeSharing</title>
      </Head>

      {copied && (
        <Alert
          status="success"
          ref={floating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: "auto",
          }}
        >
          <AlertIcon />
          复制成功！
        </Alert>
      )}

      <div
        className="flex "
        style={{
          height: "calc(100vh - 40px)",
        }}
      >
        <div className="w-1/2 flex flex-col">
          <div className="bg-gray-900 text-gray-100 flex gap-3 px-8 py-2">
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
              className={`${lang === "js" ? "text-blue-500" : ""} cursor-pointer`}
              onClick={() => setLang("js")}
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
            className="w-full flex-1"
            ref={canvasRef}
            srcDoc={`
            <script>
              var fns = new Map()
              for(let key in console) {
                fns.set(key, console[key])
                console[key] = (...args) => {
                  window.parent.postMessage({ type: 'console.' + key, args }, "*")
                  return fns.get(key)(...args)
                }
              }
            </script>
            ${codes.html}<style>${codes.css}</style><script>${codes.js}</script>`}
          ></iframe>
          <div
            className="rounded-t-md
          border-t-2
          border-gray-100
          bg-black text-gray-100"
          >
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

export default CodeSharing
