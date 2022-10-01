import Link from "next/link"
import Layout from "app/core/layouts/Layout"
import { BlitzPage } from "@blitzjs/next"
import Card from "app/core/components/Card"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import { TabList, Tabs, Tab, Text, TabPanels, TabPanel } from "@chakra-ui/react"
import Loading from "app/core/components/Loading"

const type = ["user"]

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
          type: type[tabIndex],
        },
      })
        .then((res) => {
          setResult(res.data)
        })
        .finally(() => {
          setSearching(false)
        })
    }
  }, [router.query])

  function handleTabsChange(index) {
    setTabIndex(index)
  }

  return (
    <Layout title="Home">
      <main className="grid grid-cols-1 w-[800px] m-auto gap-8">
        <Tabs index={tabIndex} onChange={handleTabsChange}>
          <TabList>
            <Tab>用户</Tab>
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
          </TabPanels>
        </Tabs>
      </main>
    </Layout>
  )
}

const User = (user) => {
  return (
    <div className="w-full border-b border-gray-200 py-4">
      <div>{user.email}</div>
      <div></div>
    </div>
  )
}

export default SearchPage
