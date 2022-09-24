import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetTrainingAnswersByUserInput
  extends Pick<Prisma.TrainingAnswerFindManyArgs, "where" | "orderBy" | "skip" | "take"> {
  userId: string
  trainingNumbers: number[]
}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetTrainingAnswersByUserInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: trainingAnswers,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      // TODO: Add your own query logic here
      skip,
      take,
      count: () => db.trainingAnswer.count({ where }),
      query: (paginateArgs) => db.trainingAnswer.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      trainingAnswers,
      nextPage,
      hasMore,
      count,
    }
  }
)
