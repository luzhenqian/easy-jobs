import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateBook = z.object({
  name: z.string(),
  url: z.string(),
  cover: z.string(),
  order: z.number(),
})

export default resolver.pipe(resolver.zod(CreateBook), resolver.authorize(), async (input) => {
  const book = await db.book.create({ data: input })
  return book
})
