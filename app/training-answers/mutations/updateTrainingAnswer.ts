import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import axios from "axios"

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
      const httpClient = axios.create({
        baseURL: process.env.AWS_REGION
          ? "https://easy-jobs-screenshot.vercel.app"
          : "http://localhost:3003",
      })

      const answer = await db.trainingAnswer.findUnique({ where: { id } })
      const { trainingId } = answer!
      const training = await db.training.findFirst({ where: { recordId: trainingId } })

      const [originImageBinary, targetImageBinary] = await Promise.all([
        httpClient({
          method: "post",
          url: "/api/screenshot",
          data: {
            code: `${data.code.html}<style>${data.code.css}</style>`,
          },
          responseType: "arraybuffer",
        }).then((res) => res.data),
        httpClient({
          method: "post",
          url: "/api/screenshot",
          data: {
            code: `${(training?.code as any).html}<style>${(training?.code as any).css}</style>`,
          },
          responseType: "arraybuffer",
        }).then((res) => res.data),
      ])

      let pass = false
      if (originImageBinary.equals(targetImageBinary)) {
        pass = true
      }

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
