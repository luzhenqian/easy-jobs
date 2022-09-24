import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteCodeSharing = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteCodeSharing),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const codeSharing = await db.codeSharing.deleteMany({ where: { id } });

    return codeSharing;
  }
);
