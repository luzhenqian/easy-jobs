import Link from "next/link"
import Layout from "app/core/layouts/Layout"
import { BlitzPage } from "@blitzjs/next"
import Card from "app/core/components/Card"

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <main className="grid grid-cols-2 w-[800px] m-auto gap-8">
        <Card>
          <h1 className="flex justify-center items-center m-10 text-4xl font-bold">
            <Link href="/trainings">
              <a>练习题</a>
            </Link>
          </h1>
        </Card>
        <Card>
          <h1 className="flex justify-center items-center m-10 text-4xl font-bold">
            <Link href="/code-sharing">
              <a>代码分享</a>
            </Link>
          </h1>
        </Card>
        <Card>
          <h1 className="flex justify-center items-center m-10 text-4xl font-bold">
            <Link href="/homepage">
              <a>个人网站</a>
            </Link>
          </h1>
        </Card>
      </main>
    </Layout>
  )
}

export default Home
