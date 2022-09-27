import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetCodeSharingsInput
  extends Pick<Prisma.CodeSharingFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  // resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCodeSharingsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: codeSharings,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.codeSharing.count({ where }),
      query: (paginateArgs) => db.codeSharing.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      codeSharings,
      nextPage,
      hasMore,
      count,
    }
  }
)
