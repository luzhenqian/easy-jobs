import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import { SignupForm } from "app/auth/components/SignupForm"
import { BlitzPage, Routes } from "@blitzjs/next"
import Card from "app/core/components/Card"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout title="Sign Up">
      <div className="flex justify-center items-center">
        <Card>
          <SignupForm onSuccess={() => router.push(Routes.Home())} />
        </Card>
      </div>
    </Layout>
  )
}

export default SignupPage
