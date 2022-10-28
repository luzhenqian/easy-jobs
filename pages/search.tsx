import Link from "next/link"
import Layout from "app/core/layouts/Layout"
import { BlitzPage, Routes } from "@blitzjs/next"
import Card from "app/core/components/Card"
import { Router, useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import { TabList, Tabs, Tab, Text, TabPanels, TabPanel } from "@chakra-ui/react"
import Loading from "app/core/components/Loading"

const types = ["user", "code"]

const SearchPage: BlitzPage = () => {
  const router = useRouter()
  const [result, setResult] = useState<any[]>([])
  const [tabIndex, setTabIndex] = useState(0)
  const [searching, setSearching] = useState(false)
  useEffect(() => {
    if (router.query.keywords) {
      setSearching(true)
      void axios({
        method: "get",
        url: "/api/search",
        params: {
          keywords: router.query.keywords,
          type: types[tabIndex],
        },
      })
        .then((res) => {
          setResult(res.data)
        })
        .finally(() => {
          setSearching(false)
        })
    }
  }, [router.query, tabIndex])

  useEffect(() => {
    if (router.query.type) {
      setTabIndex(types.indexOf(router.query.type as string))
    }
  }, [router.query.type])

  useEffect(() => {
    if (!router.isReady) {
      return
    }
    void router.push(
      Routes.SearchPage({
        keywords: router.query.keywords,
        type: types[tabIndex],
      })
    )
  }, [tabIndex])

  function handleTabsChange(index) {
    setTabIndex(index)
  }

  return (
    <Layout title="Home">
      <main className="grid grid-cols-1 w-[800px] m-auto gap-8">
        {!router.isReady ? (
          <Loading />
        ) : (
          <Tabs index={tabIndex} onChange={handleTabsChange}>
            <TabList>
              <Tab>用户</Tab>
              <Tab>代码</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {searching ? (
                  <Loading />
                ) : (
                  <>
                    {result.length === 0 && <Text fontSize={"xl"}>暂无数据</Text>}
                    {result.map((item) => {
                      return <div key={item.id}>{item.type === "user" && <User {...item} />}</div>
                    })}
                  </>
                )}
              </TabPanel>
              <TabPanel>
                {searching ? (
                  <Loading />
                ) : (
                  <>
                    {result.length === 0 && <Text fontSize={"xl"}>暂无数据</Text>}
                    {result.map((item) => {
                      return <Code key={item.id} {...item} />
                    })}
                  </>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </main>
    </Layout>
  )
}

const User = (user) => {
  return (
    <div className="w-full py-4 border-b border-gray-200">
      <div>{user.email}</div>
      <div></div>
    </div>
  )
}

const Code = (code) => {
  return (
    <div className="flex justify-between w-full py-4 border-b border-gray-200 cursor-pointer">
      <div className="flex gap-4">
        {/* <img
        className="object-cover w-[192px] h-[108px]"
        src={`data:image/jpg;base64,${code.cover}`}
      /> */}

        <Link
          href={Routes.CodeSharingHashPage({
            codeSharingId: code.recordId,
          })}
        >
          <div>{code.name}</div>
        </Link>
      </div>
      <div>
        <div>{code.author.name || code.author.email}</div>
      </div>
    </div>
  )
}

export default SearchPage
