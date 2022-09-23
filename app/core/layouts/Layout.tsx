import Head from "next/head"
import React, { FC, Suspense } from "react"
import { BlitzLayout } from "@blitzjs/next"
import Link from "next/link"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { Avatar, Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react"

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <Menu>
        <MenuButton>
          <Avatar size={"sm"} name={currentUser.name || currentUser.email}></Avatar>
        </MenuButton>
        <MenuList className="text-sm">
          <MenuItem
            onClick={async () => {
              await logoutMutation()
            }}
          >
            退出登录
          </MenuItem>
        </MenuList>
      </Menu>
    )
  } else {
    return (
      <div className="gap-2 flex">
        <Link href={Routes.SignupPage()}>
          <a>
            <Button size="sm">注册</Button>
          </a>
        </Link>
        <Link href={Routes.LoginPage()}>
          <a>
            <Button size="sm">登录</Button>
          </a>
        </Link>
      </div>
    )
  }
}

const Layout: BlitzLayout<{
  bodyStyle?: Partial<CSSStyleDeclaration>
  title?: string
  children?: React.ReactNode
}> = ({ bodyStyle, title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "easy-jobs"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={"flex items-center justify-between h-[80px] px-16 font-medium text-2xl"}>
        <Link href="/">easy jobs</Link>

        <Suspense fallback="Loading...">
          <UserInfo />
        </Suspense>
      </header>

      <main
        className={`flex flex-col items-center justify-center py-2`}
        // @ts-ignore
        style={{ ...bodyStyle, height: "calc(100vh - 80px)" }}
      >
        {children}
      </main>
    </>
  )
}

export default Layout
