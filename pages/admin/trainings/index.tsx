import { Suspense, useRef } from "react"
import { Routes, useParam } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getTrainings from "app/trainings/queries/getTrainings"
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  Box,
  ButtonGroup,
} from "@chakra-ui/react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Loading from "app/core/components/Loading"
import deleteTraining from "app/trainings/mutations/deleteTraining"
import dayjs from "dayjs"

const ITEMS_PER_PAGE = 10

export const TrainingsList = () => {
  const router = useRouter()
  const currentUser = useCurrentUser()

  const page = Number(router.query.page) || 0
  const [{ trainings, hasMore, count }] = usePaginatedQuery(getTrainings, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  if (trainings.length === 0) {
    return <div>暂无题目</div>
  }
  return (
    <div className="flex flex-col gap-4 text-sm overflow-x-auto w-full">
      <Table className="[word-break:keep-all] [white-space:pre] relative">
        <Thead>
          <Tr>
            <Th>题号</Th>
            <Th>题目</Th>
            <Th>类型</Th>
            <Th>创建时间</Th>
            <Th>更新时间</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {trainings.map((training) => (
            <Tr
              className="cursor-pointer"
              key={training.id}
              onClick={() => {
                void router.push(
                  Routes.AdminEditTrainingPage({
                    order: training.order,
                  })
                )
              }}
            >
              <Td>{training.order}</Td>
              <Td>
                <a
                  href={`/admin/trainings/${training.recordId}/edit`}
                  target={currentUser?.role === "ADMIN" ? "" : "_blank"}
                  rel="noreferrer"
                >
                  {training.name}
                </a>
              </Td>
              <Td>{training.type}</Td>
              <Td>{dayjs(training.createdAt).format("YYYY年MM月DD日 HH:mm:ss")}</Td>
              <Td>{dayjs(training.updatedAt).format("YYYY年MM月DD日 HH:mm:ss")}</Td>
              <Td className="flex gap-1">
                <Link
                  href={Routes.AdminEditTrainingPage({
                    order: training.order,
                  })}
                >
                  <span>编辑</span>
                </Link>
                <span>|</span>
                <Delete id={training.id} />
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

const Delete = ({ id }) => {
  const initialFocusRef = useRef<any>()

  const [deleteTrainingMutation] = useMutation(deleteTraining)

  return (
    <Popover initialFocusRef={initialFocusRef} placement="bottom" closeOnBlur={false}>
      {({ onClose }) => {
        return (
          <>
            <PopoverTrigger>
              <span>删除</span>
            </PopoverTrigger>
            <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
              <PopoverHeader pt={4} fontWeight="bold" border="0">
                确认删除该条数据吗？
              </PopoverHeader>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>删除后数据不可恢复！</PopoverBody>
              <PopoverFooter
                border="0"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                pb={4}
              >
                <Box fontSize="sm"></Box>
                <ButtonGroup size="sm">
                  <Button colorScheme="green" onClick={onClose}>
                    取消
                  </Button>
                  <Button
                    colorScheme="red"
                    ref={initialFocusRef}
                    onClick={async () => {
                      if (window.confirm("This will be deleted")) {
                        await deleteTrainingMutation({ id })
                        // void router.push(Routes.TrainingsPage())
                      }
                    }}
                  >
                    删除
                  </Button>
                </ButtonGroup>
              </PopoverFooter>
            </PopoverContent>
          </>
        )
      }}
    </Popover>
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
