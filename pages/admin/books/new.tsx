import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
import createBook from "app/books/mutations/createBook"
import { BookForm, FORM_ERROR } from "app/books/components/BookForm"

const NewBookPage = () => {
  const router = useRouter()
  const [createBookMutation] = useMutation(createBook)

  return (
    <Layout title={"Create New Book"}>
      <h1>Create New Book</h1>

      <BookForm
        submitText="Create Book"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateBook}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const book = await createBookMutation(values)
            void router.push(Routes.ShowBookPage({ bookId: book.id }))
          } catch (error: any) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.BooksPage()}>
          <a>Books</a>
        </Link>
      </p>
    </Layout>
  )
}

NewBookPage.authenticate = true

export default NewBookPage
