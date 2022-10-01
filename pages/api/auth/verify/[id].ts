import { BlitzAPIHandler } from "@blitzjs/next"
import db from "db"
import redis from "lib/redis"
import encodeUrl from "encodeurl"

const handler: BlitzAPIHandler<any> = async (req, res) => {
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
        res.setHeader("Location", encodeUrl("/auth/login?verified=true&msg=账号激活成功，请登录！"))
        res.end()
        return
      }
    }
  }

  res.statusCode = 301
  res.setHeader("Location", encodeUrl("/auth/signup?verified=false&msg=邮箱认证失败，请重新注册！"))
  res.end()
}
export default handler
