import { SecurePassword } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { Signup } from "../validations"
import { nanoid } from "nanoid"
import redis from "lib/redis"
import { sendMail } from "lib/mail"
import Mail from "nodemailer/lib/mailer"

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
      await redis.set(verifyId, dbuser.recordId)
      await redis.expire(verifyId, 12 * 60 * 60)
      // 重新发送邮件
      await sendVerifyMail(email, verifyId)
      return {}
    }
  } else {
    // 保存到数据库
    const hashedPassword = await SecurePassword.hash(password.trim())
    const user = await db.user.create({
      data: { email: email.toLowerCase().trim(), hashedPassword, role: "USER", status: 0 },
      select: { id: true, name: true, email: true, role: true, recordId: true },
    })
    if (user) {
      // 生成验证码
      const verifyId = nanoid()
      // 保存到 redis
      await redis.set(verifyId, user.recordId)
      await redis.expire(verifyId, 12 * 60 * 60)
      // 发送邮件
      await sendVerifyMail(email, verifyId)
      return user
    }
  }
})

async function sendVerifyMail(email: string, verifyId: string) {
  const mailData: Mail.Options = {
    from: {
      name: "EasyJobs",
      address: process.env.SMTP_USER!,
    },
    to: email,
    subject: "EasyJobs 邮箱验证",
    html: `
    <div style="max-width:550px; min-width:320px;  background-color: white; border: 1px solid #DDDDDD; margin-right: auto; margin-left: auto;">
    <div style="margin-left:30px;margin-right:30px">
        <p>&nbsp;</p>
        <p><a href="https://logico.com.ar" style="text-decoration:none;font-family:Verdana, Geneva, sans-serif;font-weight: bold; color: #3D3D3D;font-size: 15px">easyjobs.biz</a></p>
        <hr style="margin-top:10px;margin-bottom:65px;border:none;border-bottom:1px solid red" />
        <h1 style="font-family: Tahoma, Geneva, sans-serif; font-weight: normal; color: #2A2A2A; text-align: center; margin-bottom: 65px;font-size: 20px; letter-spacing: 6px;font-weight: normal; border: 2px solid black; padding: 15px;">欢迎成为 easy jobs 的用户!</h1>
        <h3 style="font-family:Palatino Linotype, Book Antiqua, Palatino, serif;font-style:italic;font-weight:500">尊敬的<span style="border-bottom: 1px solid red">用户</span>您好:</h3>
        <p style="font-family:Palatino Linotype, Book Antiqua, Palatino, serif;font-size: 15px; margin-left: auto; margin-right: auto; text-align: justify;color: #666;line-height:1.5;margin-bottom:75px">欢迎注册 easyjobs，祝你工作更加顺利！</p>
        <table style="width:100%;">
            <th>
            <td style="width:25%"></td>
            <td style="background-color:black;with:50%;text-align:center;padding:15px"><a href="${process.env.ORIGIN}/api/auth/verify/${verifyId}" target="_blank" style="margin-left: auto; margin-right: auto;text-decoration:none;color: white;text-align:center;font-family:Courier New, Courier, monospace;font-weight:600;letter-spacing:2px;background-color:black;padding:15px">完成验证</a></td>
            <td style="width:25%"></td>
            </th>
        </table>
        <hr style="margin-top:10px;margin-top:75px" />
        <p style="text-align:center;margin-bottom:15px">
            <small style="text-align:center;font-family:Courier New, Courier, monospace;font-size:10px;color#666;">
            <a href="${process.env.ORIGIN}" style="color:#666">easyjobs.biz</a>
             一个专注程序员工作与成长的网站！
            </small>
        </p>
        <p>&nbsp;</p>
    </div>
</div>`,
  }
  return sendMail(mailData)
}
