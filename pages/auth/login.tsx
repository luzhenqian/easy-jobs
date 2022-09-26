import { BlitzPage, useParam, useRouterQuery } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import { LoginForm } from "app/auth/components/LoginForm"
import { useRouter } from "next/router"
import Card from "app/core/components/Card"
import { useToast } from "@chakra-ui/react"
import { useEffect } from "react"

const LoginPage: BlitzPage = (props) => {
  const router = useRouter()
  const toast = useToast()
  useEffect(() => {
    const { verified, msg } = router.query
    if (verified === "true") {
      toast({
        title: msg,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } else if (verified === "false") {
      toast({
        title: msg,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    }
  }, [router.query])

  return (
    <Layout title="登录">
      <div className="w-[800px] m-auto flex justify-center">
        <Card>
          <LoginForm
            onSuccess={(_user) => {
              const next = router.query.next ? decodeURIComponent(router.query.next as string) : "/"
              return router.push(next)
            }}
          />
        </Card>
      </div>
    </Layout>
  )
}

export default LoginPage
