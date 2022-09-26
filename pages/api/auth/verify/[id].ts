import { BlitzAPIHandler } from "@blitzjs/next"
import login from "app/auth/mutations/login"
import db from "db"
import redis from "lib/redis"

const handler: BlitzAPIHandler<any> = async (req, res) => {
  console.log("req.query.id", req.query.id)

  const id = await redis.getdel(req.query.id as string)
  if (id) {
    const user = await db.user.findFirst({ where: { recordId: id } })
    if (user) {
      const result = await db.user.update({
        where: { id: user.id },
        data: { status: 1 },
      })
      if (result.status === 1) {
        res.statusCode = 301
        res.setHeader("Location", "/auth/login?verified=true&msg=您的邮箱已经注册成功")
        res.end()
        return
      }
    }
  }

  res.statusCode = 301
  res.setHeader("Location", "/auth/signup?verified=false&msg=邮箱认证失败，请重新注册")
  res.end()
}
export default handler
