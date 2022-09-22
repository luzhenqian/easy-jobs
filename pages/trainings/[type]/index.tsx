import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getTrainings from "app/trainings/queries/getTrainings"
import Card from "app/core/components/Card"

const ITEMS_PER_PAGE = 100

export const TrainingsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ trainings, hasMore }] = usePaginatedQuery(getTrainings, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {trainings.map((training) => (
          <li key={training.id}>
            <Link href={Routes.ShowTrainingPage({ trainingId: training.id })}>
              <a>{training.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const TrainingsCatePage = () => {
  return (
    <Layout>
      <Head>
        <title>Trainings</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewTrainingPage()}>
            <a>Create Training</a>
          </Link>
        </p>

        <div className="flex gap-10 text-3xl">
          <Card>CSS</Card>
          <Card>JavaScript</Card>
        </div>
        {/* <Suspense fallback={<div>Loading...</div>}>
          <TrainingsList />
        </Suspense> */}
      </div>
    </Layout>
  )
}

export default TrainingsCatePage
