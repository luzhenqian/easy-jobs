import { useEffect, useRef, useState } from "react"
import { Routes, useParam } from "@blitzjs/next"
import Head from "next/head"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import { Button, Input, Select, useToast } from "@chakra-ui/react"
import { useLocalStorage } from "app/core/hooks/useLocalStorage"
import createCodeSharing from "app/code-sharings/mutations/createCodeSharing"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { Link as LinkIcon } from "app/core/components/Icons"
import useCopyToClipboard from "app/core/hooks/useCopyToClipboard"
import getCodeSharings from "../queries/getCodeSharings"
import Link from "next/link"
import { Console } from "./Console"
import JavaScriptEditor from "./JavaScriptEditor"
import { Canvas } from "./Canvas"
import VueEditor from "./VueEditor"

type Frameworks = "javascript" | "vue"

const CodeSharing = () => {
  const user = useCurrentUser()
  const [createCodeSharingMutation] = useMutation(createCodeSharing)
  const codeSharingId = useParam("codeSharingId", "string") || ""
  const [framework, setFramework] = useLocalStorage<Frameworks>("codes", "javascript")
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
  let editorRef = useRef<any>()
  const sharedStepSecond = async () => {
    setSharing(true)
    const { recordId, name } = await createCodeSharingMutation({
      code: editorRef.current.getCodes(),
      userId: user?.recordId || "",
      name: shareName,
    })
    setSharing(false)
    await router.push(`/code-sharing/${recordId}#${name}`)
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
  codeSharingId && count === 0 && router.replace("/404")
  const [_, copy] = useCopyToClipboard()
  const [doc, setDoc] = useState("")
  const [logs, setLogs] = useState<{ type: "log" | "error" | "info"; args: any }[]>([])
  // 监听 iframe message 事件
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

    return () => {
      window.removeEventListener("message", onMessage)
    }
  }, [])
  // 每次 doc 重新渲染，都清空日志
  useEffect(() => {
    setLogs([])
  }, [doc])

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

            <Select
              size={"sm"}
              onChange={function (e) {
                setFramework(e.target.value)
              }}
              value={framework}
            >
              <option onSelect={(v) => console.log(v)} value="javascript">
                原生 JavaScript
              </option>
              <option value="vue">Vue</option>
            </Select>
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
        {framework === "javascript" ? (
          <JavaScriptEditor
            initialCodes={codeSharingId ? codeSharings[0] : null}
            onRunJS={(code) => setDoc(`${code}<script id="${Math.random()}"></script>`)}
            onChange={(code) => setDoc(code)}
          />
        ) : (
          <VueEditor
            initialCodes={codeSharingId ? codeSharings[0] : null}
            onRunJS={(code) => setDoc(`${code}<script id="${Math.random()}"></script>`)}
            onChange={(code) => setDoc(code)}
          />
        )}

        <div className="flex flex-col flex-1 min-w-[280px]">
          <Canvas type={framework} doc={doc} />
          <Console logs={logs} setLogs={setLogs} />
        </div>
      </div>
    </Layout>
  )
}

export default CodeSharing
