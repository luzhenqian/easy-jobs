import Link from "next/link"
import Layout from "app/core/layouts/Layout"
import { BlitzPage } from "@blitzjs/next"
import Card from "app/core/components/Card"

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <main className="grid grid-cols-2 w-[800px] m-auto gap-8">
        <Link href="/trainings">
          <a>
            <Card className="flex justify-center w-full p-8">
              <h1 className="flex items-center justify-center m-10 text-4xl font-bold">练习题</h1>
            </Card>
          </a>
        </Link>

        <Link href="/code-sharing">
          <a>
            <Card className="flex justify-center w-full p-8">
              <h1 className="flex items-center justify-center m-10 text-4xl font-bold">代码分享</h1>
            </Card>
          </a>
        </Link>

        <Link href="/resources">
          <a>
            <Card className="flex justify-center w-full p-8">
              <h1 className="flex items-center justify-center m-10 text-4xl font-bold">学习资源</h1>
            </Card>
          </a>
        </Link>

        {/* <Link href="/homepage">
          <a>
            <Card className="flex justify-center w-full p-8">
              <h1 className="flex items-center justify-center m-10 text-4xl font-bold">个人主页</h1>
            </Card>
          </a>
        </Link>

        <Link href="/resume">
          <a>
            <Card className="flex justify-center w-full p-8">
              <h1 className="flex items-center justify-center m-10 text-4xl font-bold">简历制作</h1>
            </Card>
          </a>
        </Link> */}
      </main>
    </Layout>
  )
}

export default Home
