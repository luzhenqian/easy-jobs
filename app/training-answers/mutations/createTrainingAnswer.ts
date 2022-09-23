import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateTrainingAnswer = z.object({
  userId: z.string(),
  trainingId: z.string(),
  code: z.object({
    html: z.string(),
    css: z.string(),
  }),
  isDraft: z.boolean(),
})

export default resolver.pipe(
  resolver.zod(CreateTrainingAnswer),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const trainingAnswer = await db.trainingAnswer.create({
      data: {
        ...input,
        pass: false,
      },
    })

    return trainingAnswer
  }
)
