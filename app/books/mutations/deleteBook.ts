import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteBook = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteBook),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const book = await db.book.deleteMany({ where: { id } });

    return book;
  }
);
