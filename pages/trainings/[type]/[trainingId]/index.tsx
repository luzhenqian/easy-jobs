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
import { Do } from "app/trainings/components/Do"
import PageLoading from "app/core/components/PageLoading"

const DoTrainingPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Do />
    </Suspense>
  )
}

DoTrainingPage.authenticate = true
DoTrainingPage.getLayout = (page) => (
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

export default DoTrainingPage
