import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Loading from "app/core/components/Loading"
import { Button, Heading } from "@chakra-ui/react"
import Monaco from "@monaco-editor/react"
import createTrainingAnswer from "app/training-answers/mutations/createTrainingAnswer"
import getTrainingAnswers from "app/training-answers/queries/getTrainingAnswers"
import updateTrainingAnswer from "app/training-answers/mutations/updateTrainingAnswer"
import getTrainings from "app/trainings/queries/getTrainings"
import { useLocalStorage } from "app/core/hooks/useLocalStorage"

export const DoCSS = () => {
  const [createTrainingAnswerMutation] = useMutation(createTrainingAnswer)
  const user = useCurrentUser()!
  const router = useRouter()
  const type = useParam("type", "string")

  const trainingId = useParam("trainingId", "string")
  const [{ trainings }] = usePaginatedQuery(getTrainings, { where: { recordId: trainingId } })
  const training = trainings[0]!
  const [layout, setLayout] = useLocalStorage<{
    html: boolean
    css: boolean
    current: boolean
    target: boolean
  }>("training.layout", {
    html: true,
    css: true,
    current: true,
    target: true,
  })
  const [code, setCode] = useLocalStorage<{ html: string; css: string }>("training.code", {
    html: "",
    css: "",
  })

  const cssRef = useRef()
  const htmlRef = useRef()
  function handleHTMLEditorDidMount(editor: any) {
    htmlRef.current = editor
  }
  function handleCSSEditorDidMount(editor: any) {
    cssRef.current = editor
  }

  let htmlTimer: any | null = null
  function handleHTMLEditorChange(value) {
    if (htmlTimer !== null) {
      clearTimeout(htmlTimer)
    }
    htmlTimer = setTimeout(() => {
      setCode({ ...code, html: value })
    }, 1_000)
  }

  let cssTimer: any | null = null
  function handleCSSEditorChange(value) {
    if (cssTimer !== null) {
      clearTimeout(cssTimer)
    }
    cssTimer = setTimeout(() => {
      setCode({ ...code, css: value })
    }, 1_000)
  }

  const [submitting, setSubmitting] = useState(false)
  async function submit() {
    setSubmitting(true)
    await createTrainingAnswerMutation({
      userId: user.recordId,
      trainingId: router.query.trainingId as string,
      code,
    })
    setCode({ html: "", css: "" })
    setSubmitting(false)
  }

  return (
    <Layout
      headerStyle={{
        height: "40px",
        maxWidth: "100%",
        backgroundColor: "#1e1e1e",
        color: "var(--chakra-colors-gray-100)",
        borderBottom: "1px solid var(--chakra-colors-gray-400)",
      }}
      actions={
        <div className="flex justify-end flex-1 px-4">
          <div className="flex gap-4">
            <Button size={"xs"} bgColor="green.500">
              <Link href={`/trainings/${type}/${trainingId}/history`}>
                <a>历史记录</a>
              </Link>
            </Button>
            <Button
              backgroundColor={"blue.500"}
              color={"white"}
              onClick={submit}
              disabled={submitting}
              size={"xs"}
            >
              提交
            </Button>
          </div>
        </div>
      }
    >
      <div
        className="flex flex-col gap-1 bg-[#1e1e1e] text-gray-100"
        style={{
          height: "calc(100vh - 40px)",
        }}
      >
        <div className="px-16 py-2">
          <Heading size={"sm"}>{training.name}</Heading>
        </div>
        <div className="flex flex-1 w-full border-t border-gray-200">
          {layout.html ? (
            <div className="flex flex-col flex-1 w-0">
              <div
                className="px-8 py-2 text-lg text-blue-400 border border-gray-200"
                onClick={() => setLayout({ ...layout, html: !layout.html })}
              >
                html
              </div>
              <div className="flex-1 border border-gray-400">
                <Monaco
                  language="html"
                  defaultValue={code.html}
                  onMount={handleHTMLEditorDidMount}
                  onChange={handleHTMLEditorChange}
                  loading={<Loading />}
                  theme="vs-dark"
                ></Monaco>
              </div>
            </div>
          ) : (
            <div
              className="p-2 text-lg
          text-blue-400
          border border-gray-200 [writing-mode:vertical-lr]"
              onClick={() => setLayout({ ...layout, html: !layout.html })}
            >
              html
            </div>
          )}
          {layout.css ? (
            <div className="flex flex-col flex-1 w-0">
              <div
                className="px-8 py-2 text-lg text-blue-400 border border-gray-200"
                onClick={() => setLayout({ ...layout, css: !layout.css })}
              >
                css
              </div>
              <div className="flex-1 border border-gray-400">
                <Monaco
                  language="css"
                  defaultValue={code.css}
                  onMount={handleCSSEditorDidMount}
                  onChange={handleCSSEditorChange}
                  loading={<Loading />}
                  theme="vs-dark"
                ></Monaco>
              </div>
            </div>
          ) : (
            <div
              className="p-2 text-lg
          text-blue-400
          border border-gray-200 [writing-mode:vertical-lr]"
              onClick={() => setLayout({ ...layout, css: !layout.css })}
            >
              css
            </div>
          )}
          {layout.current ? (
            <div className="flex flex-col flex-1 w-0">
              <div
                className="px-8 py-2 text-lg text-blue-400 border border-gray-200"
                onClick={() => setLayout({ ...layout, current: !layout.current })}
              >
                当前效果
              </div>
              <iframe
                className="flex-1 bg-white border border-gray-400"
                srcDoc={`${code.html} <style>${code.css}</style>`}
              ></iframe>
            </div>
          ) : (
            <div
              className="p-2 text-lg
          text-blue-400
          border border-gray-200 [writing-mode:vertical-lr]"
              onClick={() => setLayout({ ...layout, current: !layout.current })}
            >
              当前效果
            </div>
          )}
          {layout.target ? (
            <div className="flex flex-col flex-1 w-0">
              <div
                className="px-8 py-2 text-lg text-blue-400 border border-gray-200"
                onClick={() => setLayout({ ...layout, target: !layout.target })}
              >
                目标效果
              </div>
              <iframe
                className="flex-1 bg-white border border-gray-400"
                srcDoc={`${(training?.code as any).html} <style>${
                  (training?.code as any).css
                }</style>`}
              ></iframe>
            </div>
          ) : (
            <div
              className="p-2 text-lg
          text-blue-400
          border border-gray-200 [writing-mode:vertical-lr]"
              onClick={() => setLayout({ ...layout, target: !layout.target })}
            >
              目标效果
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
