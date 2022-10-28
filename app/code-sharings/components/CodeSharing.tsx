import { useCallback, useEffect, useRef, useState } from "react"
import { Routes, useParam } from "@blitzjs/next"
import Head from "next/head"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import { Button, Checkbox, Input, useToast } from "@chakra-ui/react"
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
    vs: "/libs/vs",
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

  const [lang, setLang] = useLocalStorage<Lang>("editor.layout.openLanguage", "html")
  const [autoRunJS, setAutoRunJS] = useState(false)
  const [codes, setCodes] = useLocalStorage<Codes>("codes", {
    html: "",
    css: "",
    javascript: "",
  })

  const editorRef = useRef<any>()
  const canvasRef = useRef<HTMLIFrameElement | null>(null)
  const onMount = (editor) => {
    editorRef.current = editor
    if (codeSharingId && count > 0) {
      editorRef.current.setValue(codeSharings[0]!.code![lang])
      return
    }
    editorRef.current.setValue(codes[lang])
  }

  const logEditorRef = useRef<any>()
  const onLogMount = (editor) => {
    logEditorRef.current = editor
  }

  const editorOnChange = (value) => {
    setCodes((prev) => ({ ...prev, [lang]: value }))
  }

  const runJS = () => {
    if (canvasRef.current) {
      lastScript.current = codes.javascript
      setLogs([])
      canvasRef.current.srcdoc = `${preInsertScript}${codes.html}<style>${codes.css}</style><script>${codes.javascript}</script>`
    }
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
    const { recordId, name } = await createCodeSharingMutation({
      code: codes,
      userId: user?.recordId || "",
      name: shareName,
    })
    setSharing(false)
    await router.push(Routes.CodeSharingHashPage({ codeSharingId: recordId }), {
      hash: name,
    })
    toast({
      status: "success",
      title: "分享成功！",
      duration: 1000,
      position: "top",
    })
    void copy(location.href)
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

  useEffect(() => {
    if (count > 0) {
      setCodes(codeSharings[0]!.code!)
    }
  }, [codeSharings, count])

  codeSharingId && count === 0 && router.replace("/404")

  const [_, copy] = useCopyToClipboard()

  const lastScript = useRef<string>("")
  const makeDoc = useCallback(() => {
    if (autoRunJS) {
      lastScript.current = codes.javascript
    }
    return `
    ${preInsertScript}
    ${codes.html}<style>${codes.css}</style><script>${lastScript.current}</script>`
  }, [codes])
  const [doc, setDoc] = useState("")
  useEffect(() => {
    setDoc(makeDoc())
  }, [codes, makeDoc])
  const [logs, setLogs] = useState<{ type: "log" | "error" | "info"; args: any }[]>([])
  useEffect(() => {
    function onMessage(e) {
      if (
        ((e.data.type as string) || "").includes("console") ||
        ((e.data.type as string) || "").includes("error")
      ) {
        setLogs((prev) => [...prev, e.data])
      }
    }

    window.addEventListener("message", onMessage)

    if (codeSharingId) setCodes(((codeSharings as unknown as any)[0] as any).code)

    if (canvasRef.current) {
      setLogs([])
      canvasRef.current.srcdoc = makeDoc()
    }
    return () => {
      window.removeEventListener("message", onMessage)
    }
  }, [])

  useEffect(() => {
    if (editorRef.current) editorRef.current.setValue(codes[lang])
  }, [lang])

  const [consoleOpen, setConsoleOpen] = useLocalStorage("editor.layout.consoleOpen", false)
  useEffect(() => {
    setLogs([])
  }, [codes])

  useEffect(() => {
    let timer: any = null
    if (consoleOpen === true) {
      timer = setInterval(() => {
        if (logEditorRef.current) {
          logEditorRef.current.setValue(
            logs
              .map((log) => {
                return log.args
                  .map((arg) => {
                    if (typeof arg === "object") {
                      return JSON.stringify(arg)
                    }
                    return arg
                  })
                  .join(" ")
              })
              .join("\n")
          )
          timer && clearInterval(timer)
        }
      }, 5_0)
    }
    return () => timer && clearInterval(timer)
  }, [logs, consoleOpen])

  const format = () => {
    if (editorRef.current) {
      editorRef.current.trigger("anyString", "editor.action.formatDocument")
    }
  }

  const [editorWidth, setEditorWidth] = useLocalStorage("editor.layout.editorWidth", 0)
  const [consoleHeight, setConsoleHeight] = useLocalStorage("editor.layout.consoleHeight", 300)

  const [editorMoving, setEditorMoving] = useState(false)
  const [consoleMoving, setConsoleMoving] = useState(false)

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
                maxLength={16}
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
          {user && (
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
          )}
        </div>
      }
    >
      <Head>
        {codeSharings[0]?.name ? (
          <title>CodeSharing - {codeSharings[0].name}</title>
        ) : (
          <title>CodeSharing </title>
        )}
      </Head>

      <div
        className="flex "
        style={{
          height: "calc(100vh - 40px)",
        }}
      >
        <div
          className="flex flex-col min-w-[400px] relative"
          style={{
            width: editorWidth ? editorWidth + "px" : "50%",
          }}
        >
          <span
            className={`inline-block cursor-ew-resize w-[6px] z-10 bg-blue-500 opacity-0 hover:opacity-100 absolute right-0 top-0 bottom-0
            ${editorMoving && "opacity-100"}
            translate-x-[3px]`}
            onMouseDown={() => {
              setEditorMoving(true)
            }}
          ></span>

          <div className="flex flex-wrap justify-between gap-2 px-8 py-2 text-gray-100 bg-gray-900">
            <div className="flex gap-3">
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
            <div className="flex gap-3">
              <Button
                size={"xs"}
                backgroundColor={"blue.500"}
                _hover={{ backgroundColor: "blue.600" }}
                onClick={runJS}
              >
                运行 JS
              </Button>
              <Button
                size={"xs"}
                backgroundColor={"blue.500"}
                _hover={{ backgroundColor: "blue.600" }}
                onClick={format}
              >
                格式化代码
              </Button>

              <Checkbox
                checked={autoRunJS}
                value="cc"
                onChange={(e) => {
                  setAutoRunJS(e.target.checked)
                }}
              >
                自动运行 JS
              </Checkbox>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              loading={<Loading />}
              theme="vs-dark"
              language={lang}
              defaultLanguage={lang}
              onMount={onMount}
              onChange={editorOnChange}
              options={{
                fontSize: 18,
                tabSize: 2,
              }}
            ></Editor>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-[280px]">
          <iframe className="flex-1 w-full" ref={canvasRef} srcDoc={doc}></iframe>

          <div className="text-gray-100 bg-black rounded-t-lg">
            <div
              className="flex justify-between items-center px-4 h-[40px] relative"
              onClick={() => setConsoleOpen(!consoleOpen)}
            >
              {consoleOpen && (
                <span
                  className={`z-10 inline-block cursor-ns-resize h-[6px] absolute top-0 left-0 right-0 bg-blue-500 opacity-0 hover:opacity-100
                  ${consoleMoving && "opacity-100"}
                  translate-y-[-3px]`}
                  onMouseDown={() => {
                    setConsoleMoving(true)
                  }}
                ></span>
              )}

              <div>控制台</div>
              {consoleOpen ? (
                <div className="flex items-center justify-center">
                  <Button
                    size={"xs"}
                    backgroundColor={"blue.500"}
                    onClick={(e) => {
                      e.stopPropagation()
                      setLogs([])
                    }}
                    _hover={{ backgroundColor: "blue.600" }}
                  >
                    清除日志
                  </Button>
                  <ArrowDown size={"lg"} className="fill-white" />
                </div>
              ) : (
                <ArrowUp size={"lg"} className="fill-white" />
              )}
            </div>
            {consoleOpen ? (
              <div
                className="border-t border-gray-400 max-h-[70vh] min-h-[100px]"
                style={{
                  height: consoleHeight + "px",
                }}
              >
                <div></div>
                <Editor
                  language="json"
                  theme="vs-dark"
                  onMount={onLogMount}
                  options={{ readOnly: true, fontSize: 18, tabSize: 2 }}
                ></Editor>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {(editorMoving || consoleMoving) && (
        <div
          className={`fixed top-0 left-0 right-0 bottom-0 z-50 ${
            editorMoving && "cursor-col-resize"
          } ${consoleMoving && "cursor-row-resize"}`}
          onMouseMove={(e) => {
            editorMoving && setEditorWidth(e.pageX)
            consoleMoving && setConsoleHeight(document.body.clientHeight - e.pageY - 40)
          }}
          onMouseUp={() => {
            editorMoving && setEditorMoving(false)
            consoleMoving && setConsoleMoving(false)
          }}
        ></div>
      )}
    </Layout>
  )
}

const preInsertScript = `<script>
function funcToString(args) {
  Object.keys(args).forEach((key) => {
    const arg = args[key]
    if (typeof arg === "function") {
      args[key] = arg.toString()
    } else if (typeof arg === "object") {
      funcToString(arg)
    }
  })
}

function objectStringify(args) {
  Object.keys(args).forEach((key) => {
    const arg = args[key]
    if (arg instanceof HTMLElement) {
      args[key] = arg.innerHTML
    } else if (typeof arg === 'object') {
      objectStringify(arg)
    }
  })
}

function objectToString(args) {
  Object.keys(args).forEach((key) => {
    const arg = args[key]
    if (typeof arg === "object") {
      if(arg === null) {
        return
      }
      args[key] = arg.toString()
    }
  })
}

var fns = new Map()
for(let key in console) {
  fns.set(key, console[key])
  console[key] = (...args) => {
    try {
      funcToString(args)
      objectStringify(args)
    } catch (e) {
      objectToString(args)
    }
    window.parent.postMessage({ type: 'console.' + key, args }, "*")
    return fns.get(key)(...args)
  }
}

window.addEventListener('error', function(event, source, lineno, colno, error) {
  window.parent.postMessage({ type: 'error', args: [event.message] }, "*")
})
</script>`

export default CodeSharing
