import { Suspense, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getCodeSharings from "app/code-sharings/queries/getCodeSharings"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { Alert, Table, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react"
import dayjs from "dayjs"
import PageLoading from "app/core/components/PageLoading"
import deleteCodeSharing from "app/code-sharings/mutations/deleteCodeSharing"
import Loading from "app/core/components/Loading"
import useCopyToClipboard from "app/core/hooks/useCopyToClipboard"

const ITEMS_PER_PAGE = 50

export const CodeSharingsList = () => {
  const router = useRouter()
  const user = useCurrentUser()
  const [_, copy] = useCopyToClipboard()
  const toast = useToast()
  const page = Number(router.query.page) || 0
  const [{ codeSharings, hasMore }, { refetch }] = usePaginatedQuery(getCodeSharings, {
    where: { userId: user?.recordId },
    orderBy: { createdAt: "desc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [deleteCodeSharingMutation] = useMutation(deleteCodeSharing)
  const [loadingIds, setLoadingIds] = useState([-1])
  // const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  // const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <Alert variant={"left-accent"}>最多只保留最近 {ITEMS_PER_PAGE} 条记录！</Alert>
      <Table>
        <Thead>
          <Tr>
            <Th>链接</Th>
            <Th>名称</Th>
            <Th>分享时间</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {codeSharings.length === 0 && (
            <Tr>
              <Td colSpan={4} textAlign={"center"}>
                暂无数据
              </Td>
            </Tr>
          )}
          {codeSharings.map(({ id, name, recordId, createdAt }) => {
            if (loadingIds.includes(id)) {
              return (
                <Tr key={id} className="relative">
                  <Loading noText className="w-full" />
                </Tr>
              )
            }
            return (
              <Tr key={id} className="text-sm">
                <Td>
                  <Link
                    href={Routes.CodeSharingHashPage({
                      codeSharingId: recordId,
                    })}
                  >
                    <a>{recordId}</a>
                  </Link>
                </Td>
                <Td>{name}</Td>
                <Td>{dayjs(createdAt).format("YYYY年MM月DD日 HH:mm:ss")}</Td>
                <Td>
                  <span
                    className="text-blue-500"
                    onClick={async () => {
                      await copy(`${location.host}/code-sharing/${recordId}`)
                      toast({
                        title: "复制成功",
                        status: "success",
                        duration: 2000,
                        position: "top",
                      })
                    }}
                  >
                    复制
                  </span>
                  <span className="px-2">|</span>
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={async () => {
                      setLoadingIds((ids) => [...ids, id])
                      await deleteCodeSharingMutation({ id })
                      await refetch()
                      setLoadingIds((ids) => {
                        const index = ids.indexOf(id)
                        ids.splice(index, 1)
                        return ids
                      })
                    }}
                  >
                    删除分享
                  </span>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>

      {/* <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button> */}
    </div>
  )
}

const MyCodeSharings = () => {
  return (
    <Layout>
      <Head>
        <title>CodeSharings</title>
      </Head>

      <div className="w-[800px] m-auto">
        {/* <p>
          <Link href={Routes.NewCodeSharingPage()}>
            <a>Create CodeSharing</a>
          </Link>
        </p> */}
        <Suspense fallback={<Loading />}>
          <CodeSharingsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default MyCodeSharings
