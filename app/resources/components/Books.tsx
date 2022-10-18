import { Suspense } from "react"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getBooks from "app/books/queries/getBooks"
import Loading from "app/core/components/Loading"

const ITEMS_PER_PAGE = 100
const fillPrefix = (url: string) => `${process.env.CDN_HOST}${url}`

export const BooksList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ books, hasMore }] = usePaginatedQuery(getBooks, {
    orderBy: { order: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul className="flex flex-wrap gap-4">
        {books.map(({ id, name, cover, url }) => (
          <a
            download
            href={fillPrefix(url)}
            target="_blank"
            rel="noreferrer"
            key={id}
            className="inline-block"
          >
            <img
              src={fillPrefix(cover)}
              alt={fillPrefix(url)}
              className={"max-w-[135px] max-h-[200px]"}
            />
          </a>
        ))}
      </ul>

      {/* <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button> */}
    </div>
  )
}

const Books = () => {
  return (
    <Suspense fallback={<Loading />}>
      <BooksList />
    </Suspense>
  )
}

export default Books
