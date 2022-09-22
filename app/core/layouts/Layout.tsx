import Head from "next/head"
import React, { FC } from "react"
import { BlitzLayout } from "@blitzjs/next"
import Link from "next/link"

const Layout: BlitzLayout<{ title?: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <>
      <Head>
        <title>{title || "easy-jobs"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex items-center h-[40px] px-16 font-medium text-2xl">
        <Link href="/">easy jobs</Link>
      </header>

      <main
        className="flex flex-col items-center justify-center py-2"
        style={{
          height: "calc(100vh - 40px)",
        }}
      >
        {children}
      </main>
    </>
  )
}

export default Layout
