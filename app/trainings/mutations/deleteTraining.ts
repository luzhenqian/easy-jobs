import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteTraining = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteTraining),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const training = await db.training.deleteMany({ where: { id } });

    return training;
  }
);
