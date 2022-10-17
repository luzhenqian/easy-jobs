import Head from "next/head"
import Layout from "app/core/layouts/Layout"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"

const books = [
  {
    id: "1",
    name: "你不知道的JavaScript（上卷）.pdf",
    url: "https://cdn.easyjobs.biz/你不知道的JavaScript%EF%BC%88上卷%EF%BC%89.pdf",
  },
  {
    id: "2",
    name: "你不知道的JavaScript（中卷）.pdf",
    url: "https://cdn.easyjobs.biz/你不知道的JavaScript%EF%BC%88中卷%EF%BC%89.pdf",
  },
  {
    id: "3",
    name: "你不知道的JavaScript（下卷）.pdf",
    url: "https://cdn.easyjobs.biz/你不知道的JavaScript%EF%BC%88下卷%EF%BC%89.pdf",
  },
]

const Resources = () => {
  return (
    <Layout>
      <Head>
        <title>编程资源</title>
      </Head>
      <div className="flex w-[800px] m-auto gap-8">
        <Tabs className="flex-1">
          <TabList>
            <Tab>图书</Tab>
          </TabList>
          <TabPanels>
            <TabPanel className="flex flex-col gap-2">
              {books.map(({ id, name, url }) => (
                <a download href={url} target="_blank" rel="noreferrer" key={id}>
                  {name}
                </a>
              ))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Layout>
  )
}

export default Resources
