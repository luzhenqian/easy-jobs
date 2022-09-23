import { Suspense } from "react"
import { Routes, useParam } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getTrainings from "app/trainings/queries/getTrainings"
import Card from "app/core/components/Card"
import { Button, CircularProgress } from "@chakra-ui/react"

const ITEMS_PER_PAGE = 100

export const TrainingsList = () => {
  const router = useRouter()
  const type = useParam("type", "string")

  const page = Number(router.query.page) || 0
  const [{ trainings, hasMore }] = usePaginatedQuery(getTrainings, {
    orderBy: { id: "asc" },
    where: { type },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  if (trainings.length === 0) {
    return <div>暂无题目</div>
  }
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-8">
        {trainings.map((training) => (
          <li key={training.id}>
            <Card>
              <Link
                href={Routes.ShowTrainingPage({ trainingId: training.id, type: training.type })}
              >
                <a>{training.name}</a>
              </Link>
            </Card>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Button size={"xs"} bgColor="blue.500" disabled={page === 0} onClick={goToPreviousPage}>
          Previous
        </Button>
        <Button size={"xs"} bgColor="blue.500" disabled={!hasMore} onClick={goToNextPage}>
          Next
        </Button>
      </div>
    </div>
  )
}

const TrainingsCatePage = () => {
  console.log(123)
  return (
    <Layout>
      <Head>
        <title>Trainings</title>
      </Head>

      <div className="flex flex-col gap-4">
        <Button bgColor={"blue.500"} _hover={{ background: "blue.300" }} className="text-xl">
          <Link href={Routes.NewTrainingPage()}>
            <a>创建练习题</a>
          </Link>
        </Button>

        <div className="flex gap-10 text-3xl">
          <Suspense
            fallback={
              <div className="flex justify-center items-center flex-col m-auto">
                <CircularProgress isIndeterminate color="green.300" />
                <div className="text-sm">加载中...</div>
              </div>
            }
          >
            <TrainingsList />
          </Suspense>
        </div>
      </div>
    </Layout>
  )
}

export default TrainingsCatePage
