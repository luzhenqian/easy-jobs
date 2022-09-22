import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateTraining = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateTraining),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const training = await db.training.update({ where: { id }, data });

    return training;
  }
);
