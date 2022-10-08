import Head from "next/head"
import React, { Suspense } from "react"
import { BlitzLayout } from "@blitzjs/next"
import Link from "next/link"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  useQuery,
} from "@chakra-ui/react"
import Loading from "app/core/components/Loading"
import { Search as SearchIcon } from "app/core/components/Icons"
import { useRouter } from "next/router"

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <div className="flex gap-4">
        {currentUser.role === "ADMIN" && (
          <Link href={Routes.AdminPage()}>
            <a>
              <Button size="sm" bgColor={"blue.500"} textColor={"white"}>
                管理中心
              </Button>
            </a>
          </Link>
        )}
        <Menu placement="bottom-end">
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
      </div>
    )
  } else {
    return (
      <div className="flex gap-2">
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

const Search = () => {
  const router = useRouter()
  return (
    <InputGroup width={400} size={"md"}>
      <Input
        defaultValue={router.query.keywords}
        bgColor={"gray.100"}
        placeholder={"搜索"}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            void router.push(
              Routes.SearchPage({
                keywords: (e.target as HTMLInputElement)!.value,
              })
            )
          }
        }}
      />
      <InputRightElement
        onClick={() => {
          // TODO:
        }}
      >
        <SearchIcon size="lg" />
      </InputRightElement>
    </InputGroup>
  )
}

const Layout: BlitzLayout<{
  actions?: React.ReactNode
  headerStyle?: React.CSSProperties
  title?: string
  children?: React.ReactNode
}> = ({ actions, headerStyle, title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "easy-jobs"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header
        className={`max-w-[1200px] m-auto flex items-center justify-between h-[80px] px-16 font-medium text-2xl`}
        style={headerStyle}
      >
        <Link href="/">easy jobs</Link>

        {actions || <Search />}

        <Suspense fallback={<Loading className="m-0" noText />}>
          <UserInfo />
        </Suspense>
      </header>

      {children}
    </>
  )
}

export default Layout
