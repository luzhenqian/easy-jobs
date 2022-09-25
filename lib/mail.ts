import nodemailer from "nodemailer"
import Mail from "nodemailer/lib/mailer"

export async function sendMail(mailOptions: Mail.Options) {
  const transporter = nodemailer.createTransport({
    port: +process.env.SMTP_PORT!,
    host: process.env.SMTP_HOST!,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    secure: true,
  })
  mailOptions.from = process.env.SMTP_USER

  return await transporter.sendMail(mailOptions)
}
