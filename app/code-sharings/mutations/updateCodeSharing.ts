import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateCodeSharing = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateCodeSharing),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const codeSharing = await db.codeSharing.update({ where: { id }, data });

    return codeSharing;
  }
);
