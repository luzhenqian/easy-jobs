import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateTraining = z.object({
  id: z.number(),
  name: z.string(),
  code: z.object({
    html: z.string(),
    css: z.string(),
  }),
  jsFramework: z.object({}),
  cssFramework: z.object({}),
  explanation: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateTraining),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const training = await db.training.update({ where: { id }, data })

    return training
  }
)
