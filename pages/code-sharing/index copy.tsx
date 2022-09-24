import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getCodeSharings from "app/code-sharings/queries/getCodeSharings"

const ITEMS_PER_PAGE = 100

export const CodeSharingsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ codeSharings, hasMore }] = usePaginatedQuery(getCodeSharings, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {codeSharings.map((codeSharing) => (
          <li key={codeSharing.id}>
            <Link
              href={Routes.ShowCodeSharingPage({
                codeSharingId: codeSharing.id,
              })}
            >
              <a>{codeSharing.name}</a>
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

const CodeSharingsPage1 = () => {
  return (
    <Layout>
      <Head>
        <title>CodeSharings</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewCodeSharingPage()}>
            <a>Create CodeSharing</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <CodeSharingsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default CodeSharingsPage1
