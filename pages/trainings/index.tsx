import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getTrainings from "app/trainings/queries/getTrainings"
import Card from "app/core/components/Card"

const TrainingsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Trainings</title>
      </Head>

      <div className="grid grid-cols-2 w-[800px] m-auto gap-8">
        <Link href="/trainings/css">
          <a>
            <Card className="p-8 w-full flex justify-center">CSS</Card>
          </a>
        </Link>

        <Link href="/trainings/js">
          <a>
            <Card className="p-8 w-full flex justify-center">JavaScript</Card>
          </a>
        </Link>
      </div>
    </Layout>
  )
}

export default TrainingsPage
