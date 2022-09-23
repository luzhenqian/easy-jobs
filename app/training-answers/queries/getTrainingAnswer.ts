import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetTrainingAnswer = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetTrainingAnswer),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const trainingAnswer = await db.trainingAnswer.findFirst({ where: { id } });

    if (!trainingAnswer) throw new NotFoundError();

    return trainingAnswer;
  }
);
