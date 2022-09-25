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
import { DoCSS } from "app/trainings/components/DoCSS"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"
import dynamic from "next/dynamic"
import PageLoading from "app/core/components/PageLoading"

const ReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
})

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
        <h1>题号 {training.id}</h1>

        <SimpleBar
          style={{
            marginTop: "2rem",
            height: "calc(100% - 2rem)",
            overflowY: "auto",
          }}
        >
          <ReactJson src={training} theme="harmonic" />
        </SimpleBar>

        <div>
          <Link href={Routes.EditTrainingPage({ trainingId: training.id, type: training.type })}>
            <a>
              <Button size={"sm"}> 编辑</Button>
            </a>
          </Link>

          <Button
            size={"sm"}
            type="button"
            onClick={async () => {
              if (window.confirm("This will be deleted")) {
                await deleteTrainingMutation({ id: training.id })
                void router.push(Routes.TrainingsPage())
              }
            }}
            style={{ marginLeft: "0.5rem" }}
          >
            删除
          </Button>

          <Link
            href={Routes.DoTrainingPage({ trainingId: training.recordId, type: training.type })}
          >
            <a>
              <Button size={"sm"}>做题</Button>
            </a>
          </Link>
        </div>
      </div>
    </>
  )
}

const ShowTrainingPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <div className="w-[800px] m-auto flex flex-col gap-4 ">
        <Training />
      </div>
    </Suspense>
  )
}

ShowTrainingPage.authenticate = true
ShowTrainingPage.getLayout = (page) => (
  <Layout
    headerStyle={{
      height: "40px",
      backgroundColor: "#1e1e1e",
      color: "var(--chakra-colors-gray-100)",
      borderBottom: "1px solid var(--chakra-colors-gray-400)",
    }}
  >
    {page}
  </Layout>
)

export default ShowTrainingPage
