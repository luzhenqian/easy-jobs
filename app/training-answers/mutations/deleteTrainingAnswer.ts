import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteTrainingAnswer = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteTrainingAnswer),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const trainingAnswer = await db.trainingAnswer.deleteMany({
      where: { id },
    });

    return trainingAnswer;
  }
);
