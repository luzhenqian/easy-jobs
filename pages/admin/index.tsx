import Link from "next/link"
import Layout from "app/core/layouts/Layout"
import { BlitzPage, Routes } from "@blitzjs/next"
import Card from "app/core/components/Card"
import { Router } from "next/router"

const AdminPage: BlitzPage = () => {
  return (
    <Layout title="Home">
      <main className="grid grid-cols-2 w-[800px] m-auto gap-8">
        <Link href="/trainings">
          <a>
            <Card className="flex justify-center w-full p-8">
              <h1 className="flex items-center justify-center m-10 text-4xl font-bold">用户管理</h1>
            </Card>
          </a>
        </Link>

        <Link href={Routes.AdminTrainingsPage()}>
          <a>
            <Card className="flex justify-center w-full p-8">
              <h1 className="flex items-center justify-center m-10 text-4xl font-bold">
                练习题管理
              </h1>
            </Card>
          </a>
        </Link>

        <Link href="/code-sharing">
          <a>
            <Card className="flex justify-center w-full p-8">
              <h1 className="flex items-center justify-center m-10 text-4xl font-bold">
                代码分享管理
              </h1>
            </Card>
          </a>
        </Link>
      </main>
    </Layout>
  )
}

AdminPage.authenticate = true

export default AdminPage
