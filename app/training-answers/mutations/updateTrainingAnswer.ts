import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { toPng } from "html-to-image"
// const puppeteer = require("puppeteer")
import chromium from "chrome-aws-lambda"

const UpdateTrainingAnswer = z.object({
  id: z.number(),
  code: z.object({
    html: z.string(),
    css: z.string(),
  }),
  isDraft: z.boolean(),
})

export default resolver.pipe(
  resolver.zod(UpdateTrainingAnswer),
  resolver.authorize(),
  async ({ id, ...data }) => {
    let trainingAnswer
    if (data.isDraft) {
      trainingAnswer = await db.trainingAnswer.update({
        where: { id },
        data,
      })
    } else {
      const answer = await db.trainingAnswer.findUnique({ where: { id } })
      const { trainingId } = answer!
      const training = await db.training.findFirst({ where: { recordId: trainingId } })
      const browser = await chromium.puppeteer.launch()
      const originPage = await browser.newPage()
      console.log(data.code.html, "html")
      console.log(data.code.css, "css")

      await originPage.setContent(`${data.code.html}<style>${data.code.css}</style>`)
      const originImageBinary: Buffer = (await originPage.screenshot({
        encoding: "binary",
      })) as Buffer
      const targetPage = await browser.newPage()
      await targetPage.setContent(
        `${(training?.code as any).html}<style>${(training?.code as any).css}</style>`
      )
      const targetImageBinary: Buffer = (await targetPage.screenshot({
        encoding: "binary",
      })) as Buffer
      let pass = false
      console.log(originImageBinary, targetImageBinary)

      if (originImageBinary.equals(targetImageBinary)) {
        pass = true
      }
      browser.close()
      trainingAnswer = await db.trainingAnswer.update({
        where: { id },
        data: {
          ...data,
          pass,
        },
      })
    }

    return trainingAnswer
  }
)
