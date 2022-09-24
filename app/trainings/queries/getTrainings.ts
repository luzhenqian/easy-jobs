import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"
import getCurrentUser from "app/users/queries/getCurrentUser"
import getTrainingAnswers from "app/training-answers/queries/getTrainingAnswers"
import getTrainingAnswersByUser from "app/training-answers/queries/getTrainingAnswersByUser"

interface GetTrainingsInput
  extends Pick<Prisma.TrainingFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetTrainingsInput, Ctx) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const user = await getCurrentUser(null, Ctx)!
    await getTrainingAnswersByUser(
      {
        trainingNumbers: [],
        userId: user?.recordId || "",
      },
      Ctx
    )
    const {
      items: trainings,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.training.count({ where }),
      query: (paginateArgs) => db.training.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      trainings,
      nextPage,
      hasMore,
      count,
    }
  }
)
