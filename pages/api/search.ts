import { BlitzAPIHandler } from "@blitzjs/next"
import db from "db"
import { paginate } from "blitz"

interface Result {
  type: "user"
  [key: string]: any
}

const handler: BlitzAPIHandler<any> = async (req, res) => {
  let { keywords, type } = req.query
  let result: Result[] = []
  if (type === "user") {
    result = await getUsers({
      keywords: keywords as string,
    })
  }
  res.send(result)
}

async function getUsers({ keywords }: { keywords: string }) {
  const where = {
    email: {
      contains: keywords as string,
    },
    status: 1,
  }
  const {
    items: users,
    hasMore,
    nextPage,
    count,
  } = await paginate({
    skip: 0,
    take: 100,
    count: () =>
      db.user.count({
        where,
      }),
    query: (paginateArgs) =>
      db.user.findMany({
        ...paginateArgs,
        where,
        orderBy: { id: "asc" },
      }),
  })
  const result: Result[] = []

  users.forEach((user) => {
    result.push({
      type: "user",
      ...user,
    })
  })
  return result
}

export default handler
