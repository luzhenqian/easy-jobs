import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getTraining from "app/trainings/queries/getTraining"
import deleteTraining from "app/trainings/mutations/deleteTraining"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Loading from "app/core/components/Loading"
import {
  Checkbox,
  CheckboxGroup,
  Button,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Stack,
  Heading,
} from "@chakra-ui/react"
import Monaco from "@monaco-editor/react"
import createTrainingAnswer from "app/training-answers/mutations/createTrainingAnswer"
import getTrainingAnswers from "app/training-answers/queries/getTrainingAnswers"
import updateTrainingAnswer from "app/training-answers/mutations/updateTrainingAnswer"
import getTrainings from "app/trainings/queries/getTrainings"

export const Training = () => {
  const router = useRouter()

  const trainingId = useParam("trainingId", "string")
  const [deleteTrainingMutation] = useMutation(deleteTraining)
  const [{ trainings }] = useQuery(getTrainings, { where: { recordId: trainingId } })
  const training = trainings[0]!
  return (
    <>
      <Head>
        <title>Training {training.id}</title>
      </Head>

      <div>
        <h1>Training {training.id}</h1>
        <pre>{JSON.stringify(training, null, 2)}</pre>

        <Link href={Routes.EditTrainingPage({ trainingId: training.id, type: training.type })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteTrainingMutation({ id: training.id })
              void router.push(Routes.TrainingsPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const Do = () => {
  const [createTrainingAnswerMutation] = useMutation(createTrainingAnswer)
  const [updateTrainingAnswerMutation] = useMutation(updateTrainingAnswer)
  const user = useCurrentUser()!
  const router = useRouter()
  const type = useParam("type", "string")
  const [{ trainingAnswers, hasMore }] = useQuery(getTrainingAnswers, {
    where: {
      trainingId: router.query.trainingId as string,
      userId: user.recordId,
      isDraft: true,
    },
  })
  const currentDraft = trainingAnswers[0]

  const trainingId = useParam("trainingId", "string")
  const [{ trainings }] = usePaginatedQuery(getTrainings, { where: { recordId: trainingId } })
  const training = trainings[0]!
  const [layout, setLayout] = useState<string[]>(["CSS", "HTML", "cur", "target"])
  const [code, setCode] = useState({
    html: "",
    css: "",
  })

  useEffect(() => {
    if (currentDraft) {
      setCode({
        html: (currentDraft.code as any).html,
        css: (currentDraft.code as any).css,
      })
    }
  }, [currentDraft])

  const cssRef = useRef()
  const htmlRef = useRef()
  function handleHTMLEditorDidMount(editor: any) {
    htmlRef.current = editor
  }
  function handleCSSEditorDidMount(editor: any) {
    cssRef.current = editor
  }

  function handleHTMLEditorChange(value) {
    setCode({ ...code, html: value })
  }

  let timer: any | null = null
  function handleCSSEditorChange(value) {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      setCode({ ...code, css: value })
    }, 1_000)
  }

  const [submitting, setSubmitting] = useState(false)
  async function submit() {
    if (!currentDraft) {
      return ""
    }
    setSubmitting(true)
    await updateTrainingAnswerMutation({
      id: currentDraft.id,
      code,
      isDraft: false,
    })
    await createTrainingAnswerMutation({
      userId: user.recordId,
      trainingId: router.query.trainingId as string,
      code: {
        html: "",
        css: "",
      },
    })
    setSubmitting(false)
  }
  useEffect(() => {
    if (currentDraft) {
      void updateTrainingAnswerMutation({
        id: currentDraft.id,
        code,
        isDraft: true,
      })
    } else {
      if (!user || !user.recordId) return
      void createTrainingAnswerMutation({
        userId: user.recordId,
        trainingId: router.query.trainingId as string,
        code,
      })
    }
  }, [code, router.query.trainingId, user])

  return (
    <div className="flex flex-col gap-4">
      <Heading size={"md"}>{training.name}</Heading>
      <div className="flex justify-between px-4">
        <Stack spacing={4} direction="row">
          <CheckboxGroup defaultValue={layout} onChange={(e) => setLayout([...(e as string[])])}>
            <Checkbox value="HTML">HTML</Checkbox>
            <Checkbox value="CSS">CSS</Checkbox>
            <Checkbox value="cur">当前效果</Checkbox>
            <Checkbox value="target">目标效果</Checkbox>
          </CheckboxGroup>
        </Stack>

        <div className="flex gap-4">
          <Button>
            <Link href={`/trainings/${type}/${trainingId}/history`}>
              <a>历史记录</a>
            </Link>
          </Button>
          <Button
            backgroundColor={"blue.500"}
            color={"white"}
            onClick={submit}
            disabled={submitting}
          >
            提交
          </Button>
        </div>
      </div>
      <div className="flex h-[400px] w-full">
        {layout.includes("HTML") && (
          <div className="w-0 flex-1 border border-gray-400">
            <Monaco
              language="html"
              defaultValue={code.html}
              onMount={handleHTMLEditorDidMount}
              onChange={handleHTMLEditorChange}
            ></Monaco>
          </div>
        )}
        {layout.includes("CSS") && (
          <div className="w-0 flex-1  border border-gray-400">
            <Monaco
              language="css"
              defaultValue={code.css}
              onMount={handleCSSEditorDidMount}
              onChange={handleCSSEditorChange}
            ></Monaco>
          </div>
        )}
      </div>
      <div className="flex h-[400px] w-full">
        {layout.includes("cur") && (
          <iframe
            className="w-full flex-1  border border-gray-400"
            srcDoc={`${code.html} <style>${code.css}</style>`}
          ></iframe>
        )}
        {layout.includes("target") && (
          <iframe
            className="w-full flex-1  border border-gray-400"
            srcDoc={`${(training?.code as any).html} <style>${(training?.code as any).css}</style>`}
          ></iframe>
        )}
      </div>
    </div>
  )
}

const Main = () => {
  const currentUser = useCurrentUser()
  if (currentUser?.role === "ADMIN") {
    return (
      <>
        <Tabs>
          <TabList>
            <Tab>数据</Tab>
            <Tab>做题</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <div className="w-[1200px] min-h-[800px]">
                <Training />
              </div>
            </TabPanel>
            <TabPanel>
              <div className="w-[1200px] min-h-[800px]">
                <Do />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </>
    )
  }
  return (
    <div className="w-full min-w-[1200px] min-h-[800px]">
      <Do />
    </div>
  )
}

const ShowTrainingPage = () => {
  const router = useRouter()
  return (
    <div className="w-full flex justify-center items-center flex-col gap-4">
      <Button size={"md"} className="self-start">
        <Link href={Routes.TrainingsCatePage({ type: router.query.type as string })}>
          <a>返回 {router.query.type} 练习题列表</a>
        </Link>
      </Button>

      <Suspense fallback={<Loading />}>
        <Main />
      </Suspense>
    </div>
  )
}

ShowTrainingPage.authenticate = true
ShowTrainingPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowTrainingPage
