import { Suspense } from "react"
import Link from "next/link"
import Layout from "app/core/layouts/Layout"
import { Routes, BlitzPage } from "@blitzjs/next"
import Card from "app/core/components/Card"

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <main>
        <Card>
          <h1 className="m-10 text-4xl font-bold">
            <Link href="/trainings">
              <a>training</a>
            </Link>
          </h1>
        </Card>
      </main>
    </Layout>
  )
}

export default Home
