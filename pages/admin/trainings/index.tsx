import { Suspense } from "react"
import { Routes, useParam } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getTrainings from "app/trainings/queries/getTrainings"
import { Button, Table, Thead, Tbody, Tr, Td, Th } from "@chakra-ui/react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Loading from "app/core/components/Loading"
import getTrainingAnswers from "app/training-answers/queries/getTrainingAnswers"

const ITEMS_PER_PAGE = 10

export const TrainingsList = () => {
  const router = useRouter()
  const type = useParam("type", "string")
  const currentUser = useCurrentUser()

  const page = Number(router.query.page) || 0
  const [{ trainings, hasMore, count }] = usePaginatedQuery(getTrainings, {
    orderBy: { id: "asc" },
    where: { type },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [{ trainingAnswers }] = useQuery(getTrainingAnswers, {
    where: {
      trainingId: {
        in: trainings.map((training) => training.recordId),
      },
      pass: true,
      userId: currentUser?.recordId || "",
    },
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  if (trainings.length === 0) {
    return <div>暂无题目</div>
  }
  return (
    <div className="flex flex-col gap-4 text-sm">
      <Table>
        <Thead>
          <Tr>
            <Th>题号</Th>
            <Th>题目</Th>
            <Th>状态</Th>
          </Tr>
        </Thead>
        <Tbody>
          {trainings.map((training) => (
            <Tr className="cursor-pointer" key={training.id}>
              <Td>{training.order}</Td>
              <Td>
                <a
                  href={
                    currentUser?.role === "ADMIN"
                      ? `/trainings/${training.type}/admin/${training.recordId}`
                      : `/trainings/${training.type}/${training.recordId}`
                  }
                  target={currentUser?.role === "ADMIN" ? "" : "_blank"}
                  rel="noreferrer"
                >
                  {training.name}{" "}
                </a>
              </Td>
              <Td>
                {trainingAnswers.find((answers) => answers.trainingId === training.recordId)
                  ? "通过"
                  : "未通过"}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {count > ITEMS_PER_PAGE ? (
        <div className="flex gap-2">
          <Button size={"xs"} bgColor="blue.500" disabled={page === 0} onClick={goToPreviousPage}>
            Previous
          </Button>
          <Button size={"xs"} bgColor="blue.500" disabled={!hasMore} onClick={goToNextPage}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}

const Create = () => {
  const currentUser = useCurrentUser()
  if (currentUser?.role !== "ADMIN") return null
  return (
    <Button bgColor={"blue.500"} _hover={{ background: "blue.300" }} className="text-xl">
      <Link href={Routes.NewTrainingPage()}>
        <a>创建练习题</a>
      </Link>
    </Button>
  )
}

const AdminTrainingsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Trainings</title>
      </Head>

      <div className="flex flex-col  gap-10 text-3xl w-[800px] m-auto">
        <Suspense fallback={<Loading />}>
          <Create />
          <TrainingsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default AdminTrainingsPage
