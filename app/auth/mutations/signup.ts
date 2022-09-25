import { SecurePassword } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { Signup } from "../validations"
import { nanoid } from "nanoid"
import redis from "lib/redis"
import { sendMail } from "lib/mail"

export default resolver.pipe(resolver.zod(Signup), async ({ email, password }, ctx) => {
  // 先查库里有没有这个用户
  const dbuser = await db.user.findFirst({
    where: {
      email: email,
    },
  })

  if (dbuser) {
    if (dbuser.status === 1) {
      return { errMsg: "该邮箱已注册" }
    } else if (dbuser.status === 0) {
      // 邮箱已注册，但是未激活 更新验证 id
      // 保存到 redis
      const verifyId = nanoid()
      await redis.set(verifyId, "")
      await redis.expire(verifyId, 12 * 60 * 60)
      // 重新发送邮件
      await sendVerifyMail(email, verifyId)
      return {}
    }
  } else {
    // 生成验证码
    const verifyId = nanoid()
    // 保存到 redis
    await redis.set(verifyId, "")
    await redis.expire(verifyId, 12 * 60 * 60)
    // 发送邮件
    await sendVerifyMail(email, verifyId)
    // 保存到数据库
    const hashedPassword = await SecurePassword.hash(password.trim())
    const user = await db.user.create({
      data: { email: email.toLowerCase().trim(), hashedPassword, role: "USER", status: 0 },
      select: { id: true, name: true, email: true, role: true },
    })
    return user
  }
})

async function sendVerifyMail(email: string, verifyId: string) {
  const mailData = {
    to: email,
    subject: "EasyJobs 邮箱验证",
    html: `<h1>欢迎注册 Easy Jobs，您的激活地址是 ${process.env.ORIGIN}/api/verify/${verifyId}</h1>`,
  }
  return sendMail(mailData)
}
