import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import { SignupForm } from "app/auth/components/SignupForm"
import { BlitzPage, Routes } from "@blitzjs/next"
import Card from "app/core/components/Card"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout title="注册">
      <Card>
        <SignupForm onSuccess={() => router.push(Routes.Home())} />
      </Card>
    </Layout>
  )
}

export default SignupPage
