import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateTraining = z.object({
  name: z.string(),
  code: z.object({
    html: z.string(),
    css: z.string(),
  }),
  type: z.string(),
  jsFramework: z.object({}),
  cssFramework: z.object({}),
  order: z.number(),
})

export default resolver.pipe(resolver.zod(CreateTraining), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const training = await db.training.create({ data: input })

  return training
})
