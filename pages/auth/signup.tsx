import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import { SignupForm } from "app/auth/components/SignupForm"
import { BlitzPage, Routes } from "@blitzjs/next"
import Card from "app/core/components/Card"
import { useToast } from "@chakra-ui/react"
import { useEffect } from "react"

const SignupPage: BlitzPage = () => {
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
    <Layout title="注册">
      <div className="w-[800px] m-auto flex justify-center">
        <Card>
          <SignupForm
            onSuccess={async () => {
              await router.push(Routes.Home())
              toast({
                title: "激活邮件已发送，请前往邮箱激活",
                status: "success",
                duration: 2000,
                position: "top",
              })
            }}
          />
        </Card>
      </div>
    </Layout>
  )
}

export default SignupPage
