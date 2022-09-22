import { BlitzPage } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import { LoginForm } from "app/auth/components/LoginForm"
import { useRouter } from "next/router"
import Card from "app/core/components/Card"

const LoginPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout title="登录">
      <Card>
        <LoginForm
          onSuccess={(_user) => {
            const next = router.query.next ? decodeURIComponent(router.query.next as string) : "/"
            return router.push(next)
          }}
        />
      </Card>
    </Layout>
  )
}

export default LoginPage
