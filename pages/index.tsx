import { Suspense } from "react"
import Link from "next/link"
import Layout from "app/core/layouts/Layout"
import { Routes, BlitzPage } from "@blitzjs/next"

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <div className="container">
        <main>
          <div className="buttons" style={{ marginTop: "1rem", marginBottom: "1rem" }}></div>
        </main>
      </div>
    </Layout>
  )
}

export default Home
