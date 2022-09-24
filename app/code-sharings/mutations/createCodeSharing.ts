import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateCodeSharing = z.object({
  userId: z.string(),
  code: z.object({
    html: z.string(),
    css: z.string(),
    js: z.string(),
  }),
})

export default resolver.pipe(
  resolver.zod(CreateCodeSharing),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const codeSharing = await db.codeSharing.create({
      data: {
        isDraft: false,
        ...input,
      },
    })

    return codeSharing
  }
)
