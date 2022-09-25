import { Suspense } from "react"
import { Routes, useParam } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import {
  Button,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import Loading from "app/core/components/Loading"
import getTrainingAnswers from "app/training-answers/queries/getTrainingAnswers"
import dayjs from "dayjs"

const ITEMS_PER_PAGE = 10

export const TrainingsAnswerList = () => {
  const router = useRouter()
  const trainingId = useParam("trainingId", "string")
  const page = Number(router.query.page) || 0

  const [{ trainingAnswers, hasMore }] = usePaginatedQuery(getTrainingAnswers, {
    where: { trainingId, isDraft: false },
    orderBy: { updatedAt: "desc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  if (trainingAnswers.length === 0) {
    return <div>暂无题目</div>
  }
  return (
    <div className="h-full w-full flex flex-col gap-4">
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>提交时间</Th>
              <Th>提交结果</Th>
            </Tr>
          </Thead>
          <Tbody>
            {trainingAnswers.map((trainingAnswer) => (
              <Tr key={trainingAnswer.id} className="text-sm">
                <Td>
                  <a>{dayjs(trainingAnswer.updatedAt).format("YYYY年MM月DD日 hh:mm:ss")}</a>
                </Td>
                <Td>{trainingAnswer.pass ? "通过" : "未通过"}</Td>
              </Tr>
            ))}
          </Tbody>
          {trainingAnswers.length > 10 && (
            <Tfoot>
              <div className="flex gap-2 mt-4">
                <Button
                  size={"xs"}
                  bgColor="blue.500"
                  disabled={page === 0}
                  onClick={goToPreviousPage}
                >
                  上一页
                </Button>
                <Button size={"xs"} bgColor="blue.500" disabled={!hasMore} onClick={goToNextPage}>
                  下一页
                </Button>
              </div>
            </Tfoot>
          )}
        </Table>
      </TableContainer>
    </div>
  )
}

const TrainingsHistoryPage = () => {
  return (
    <Layout>
      <Head>
        <title>Trainings</title>
      </Head>

      <div className="w-[800px] m-auto flex flex-col gap-4">
        <Suspense fallback={<Loading />}>
          <TrainingsAnswerList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default TrainingsHistoryPage
