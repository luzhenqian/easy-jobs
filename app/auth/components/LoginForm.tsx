import { AuthenticationError, PromiseReturnType } from "blitz"
import Link from "next/link"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/core/components/Form"
import login from "app/auth/mutations/login"
import { Login } from "app/auth/validations"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  return (
    <div className="w-[400px] relative">
      <h1 className="text-2xl">登录</h1>

      <Form
        submitText="登录"
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            const user = await loginMutation(values)
            props.onSuccess?.(user)
          } catch (error: any) {
            if (error instanceof AuthenticationError) {
              return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
            } else {
              return {
                [FORM_ERROR]:
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
              }
            }
          }
        }}
      >
        <LabeledTextField name="email" label="邮箱" placeholder="输入电子邮箱" />
        <LabeledTextField name="password" label="密码" placeholder="输入密码" type="password" />
        <div>
          <Link href={Routes.ForgotPasswordPage()}>
            <a>忘记密码?</a>
          </Link>
        </div>
      </Form>

      <div className="absolute right-0 bottom-2">
        没有账号？{" "}
        <Link href={Routes.SignupPage()}>
          <a>去注册</a>
        </Link>
      </div>
    </div>
  )
}

export default LoginForm
