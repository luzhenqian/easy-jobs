import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateBook = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  cover: z.string(),
  order: z.number(),
})

export default resolver.pipe(
  resolver.zod(UpdateBook),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const book = await db.book.update({ where: { id }, data })

    return book
  }
)
