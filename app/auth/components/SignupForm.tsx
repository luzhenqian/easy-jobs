import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/core/components/Form"
import signup from "app/auth/mutations/signup"
import { Signup } from "app/auth/validations"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import { Routes } from "@blitzjs/next"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)
  return (
    <div className="w-[400px] relative">
      <h1 className="text-2xl">注册</h1>

      <Form
        submitText="创建账号"
        schema={Signup}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            await signupMutation(values)
            props.onSuccess?.()
          } catch (error: any) {
            if (error.code === "P2002" && error.meta?.target?.includes("email")) {
              // This error comes from Prisma
              return { email: "This email is already being used" }
            } else {
              return { [FORM_ERROR]: error.toString() }
            }
          }
        }}
      >
        <LabeledTextField name="email" label="邮箱" placeholder="输入电子邮箱" />
        <LabeledTextField name="password" label="密码" placeholder="输入密码" type="password" />
      </Form>

      <div className="absolute right-0 bottom-2">
        已有账号？{" "}
        <Link href={Routes.LoginPage()}>
          <a>去登录</a>
        </Link>
      </div>
    </div>
  )
}

export default SignupForm
