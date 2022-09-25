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
import { DoCSS } from "app/trainings/components/DoCSS"
import PageLoading from "app/core/components/PageLoading"

const DoTrainingPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <DoCSS />
    </Suspense>
  )
}

DoTrainingPage.authenticate = true

export default DoTrainingPage
