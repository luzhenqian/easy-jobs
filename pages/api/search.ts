import { BlitzAPIHandler } from "@blitzjs/next"
import db from "db"
import { paginate } from "blitz"
import { htmlToImageBuffer } from "app/training-answers/mutations/createTrainingAnswer"

interface Result {
  type: "user" | "code"
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
  if (type === "code") {
    result = await getCodes({
      keywords: keywords as string,
    })
  }
  console.log(result, "rrr")

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
        orderBy: { createdAt: "desc" },
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

async function getCodes({ keywords }: { keywords: string }) {
  const where = {
    name: {
      contains: keywords as string,
    },
  }
  const {
    items: codes,
    hasMore,
    nextPage,
    count,
  } = await paginate({
    skip: 0,
    take: 100,
    count: () =>
      db.codeSharing.count({
        where,
      }),
    query: (paginateArgs) =>
      db.codeSharing.findMany({
        ...paginateArgs,
        where,
        orderBy: { createdAt: "desc" },
      }),
  })
  const result: Result[] = []

  await asyncForEach<any>(codes, async (code) => {
    result.push({
      type: "code",
      ...code,
      author: await db.user.findFirst({
        where: {
          recordId: code.userId,
        },
      }),
      // cover: (
      //   await htmlToImageBuffer(`${(code?.code as any)?.html || ""}
      // <style>${(code?.code as any).css || ""}</style>
      // <script>${(code?.code as any)?.javascript}</script>`)
      // ).toString("base64"),
    })
  })

  return result
}

export default handler

export async function asyncForEach<T>(
  array: Array<T>,
  callback: (item: T | undefined, index: number) => Promise<void>
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index)
  }
}
