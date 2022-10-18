import Head from "next/head"
import Layout from "app/core/layouts/Layout"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import Books from "app/resources/components/Books"

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
            <TabPanel>
              <Books />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Layout>
  )
}

export default Resources
