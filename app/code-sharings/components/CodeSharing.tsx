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
import { Link } from "app/core/components/Icons/link"
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
  const onChange = (value) => {
    setCodes((prev) => ({ ...prev, [lang]: value }))
  }
  useEffect(() => {
    if (editorRef.current) editorRef.current.setValue(codes[lang])
  }, [lang])

  useEffect(() => {
    if (!canvasRef.current) return
    canvasRef.current.srcdoc = `${codes.html}<style>${codes.css}</style><script>${codes.js}</script>`
  }, [])

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
    { where: { recordId: codeSharingId } },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  count === 0 && router.replace("/404")
  useEffect(() => {
    setCodes((codeSharings[0] as any).code)
  }, [])

  const [_, copy] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  const { x, y, reference, floating, strategy } = useFloating({
    placement: "top",
    middleware: [offset(-60)],
  })
  useEffect(() => {
    if (typeof window !== "undefined") reference(document.body)
  }, [])
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
              onClick={setLang.bind(null, "js")}
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
        <div className="w-1/2">
          <iframe
            className="w-full h-full"
            ref={canvasRef}
            srcDoc={`${codes.html}<style>${codes.css}</style><script>${codes.js}</script>`}
          ></iframe>
        </div>
      </div>
    </Layout>
  )
}

export default CodeSharing
