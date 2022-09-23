import { Suspense, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
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
} from "@chakra-ui/react"
import Monaco from "@monaco-editor/react"

export const Training = () => {
  const router = useRouter()

  const trainingId = useParam("trainingId", "number")
  const [deleteTrainingMutation] = useMutation(deleteTraining)
  const [training] = useQuery(getTraining, { id: trainingId })

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
  const router = useRouter()
  const trainingId = useParam("trainingId", "number")
  const [training] = useQuery(getTraining, { id: trainingId })
  const [layout, setLayout] = useState<string[]>(["CSS", "HTML"])
  const [code, setCode] = useState({ html: "", css: "" })

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

  return (
    <div>
      <div>
        <Stack spacing={4} direction="row">
          <CheckboxGroup defaultValue={layout} onChange={(e) => setLayout([...(e as string[])])}>
            <Checkbox value="HTML">HTML</Checkbox>
            <Checkbox value="CSS">CSS</Checkbox>
            <Checkbox value="cur">当前效果</Checkbox>
            <Checkbox value="target">目标效果</Checkbox>
          </CheckboxGroup>
        </Stack>
      </div>
      <div className="flex h-[400px] w-full">
        {layout.includes("HTML") && (
          <div className="w-0 flex-1 border border-gray-400">
            <Monaco
              defaultValue={code.html}
              onMount={handleHTMLEditorDidMount}
              onChange={handleHTMLEditorChange}
            ></Monaco>
          </div>
        )}
        {layout.includes("CSS") && (
          <div className="w-0 flex-1  border border-gray-400">
            <Monaco
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
      <div>
        <Button>历史记录</Button>
        <Button>提交</Button>
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
  return <Do />
}

const ShowTrainingPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.TrainingsPage()}>
          <a>Trainings</a>
        </Link>
      </p>

      <Suspense fallback={<Loading />}>
        <Main />
      </Suspense>
    </div>
  )
}

ShowTrainingPage.authenticate = true
ShowTrainingPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowTrainingPage
