import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import axios from "axios"

const CreateTrainingAnswer = z.object({
  userId: z.string(),
  trainingId: z.string(),
  code: z.object({
    html: z.string(),
    css: z.string(),
  }),
})

export default resolver.pipe(
  resolver.zod(CreateTrainingAnswer),
  resolver.authorize(),
  async ({ userId, trainingId, code }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const training = await db.training.findFirst({ where: { recordId: trainingId } })
    const trainingAnswer = await db.trainingAnswer.create({
      data: {
        code,
        trainingId,
        userId,
        pass: await diff(
          `${code.html}<style>${code.css}</style>`,
          `${(training?.code as any).html}<style>${(training?.code as any).css}</style>`
        ),
        isDraft: true,
      },
    })

    return trainingAnswer
  }
)

async function diff(htmlStringFirst: string, htmlStringSecond: string): Promise<boolean> {
  const [firstImageBinary, secondImageBinary] = await Promise.all([
    htmlToImageBuffer(htmlStringFirst),
    htmlToImageBuffer(htmlStringSecond),
  ])

  return firstImageBinary.equals(secondImageBinary)
}

export async function htmlToImageBuffer(htmlString: string): Promise<Buffer> {
  const httpClient = axios.create({
    baseURL: process.env.AWS_REGION
      ? "https://easy-jobs-screenshot.vercel.app"
      : "http://localhost:3003",
  })

  return (
    await httpClient({
      method: "post",
      url: "/api/screenshot",
      data: {
        code: htmlString,
      },
      responseType: "arraybuffer",
    })
  ).data
}
