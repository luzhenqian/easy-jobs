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
import Card from "app/core/components/Card"
import dayjs from "dayjs"

const ITEMS_PER_PAGE = 100

export const TrainingsList = () => {
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
      <ul className="flex flex-wrap gap-8">
        <TableContainer>
          <Table className="w-[400px]">
            <Thead>
              <Tr>
                <Th>提交日期</Th>
                <Th>结果</Th>
              </Tr>
            </Thead>
            <Tbody>
              {trainingAnswers.map((trainingAnswer) => (
                <Tr
                  key={trainingAnswer.id}
                  backgroundColor={trainingAnswer.pass ? "green.400" : "red.400"}
                  className="text-sm"
                >
                  <Td>
                    {/* <Link
                href={Routes.ShowTrainingPage({
                  trainingId: trainingAnswer.id,
                })}
              > */}
                    <a>{dayjs(trainingAnswer.updatedAt).format("YYYY年MM月DD日 hh:mm:ss")}</a>
                    {/* </Link> */}
                  </Td>
                  <Td>{trainingAnswer.pass ? "通过" : "未通过"}</Td>
                </Tr>
              ))}
            </Tbody>
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
          </Table>
        </TableContainer>
      </ul>
    </div>
  )
}

const TrainingsHistoryPage = () => {
  return (
    <Layout>
      <Head>
        <title>Trainings</title>
      </Head>

      <div className="flex flex-col gap-4">
        <div className="flex gap-10 text-3xl">
          <Suspense fallback={<Loading />}>
            <TrainingsList />
          </Suspense>
        </div>
      </div>
    </Layout>
  )
}

export default TrainingsHistoryPage
