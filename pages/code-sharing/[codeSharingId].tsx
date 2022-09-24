import { Suspense } from "react"
import CodeSharing from "app/code-sharings/components/CodeSharing"
import Loading from "app/core/components/Loading"
import PageLoading from "app/core/components/PageLoading"

const CodeSharingHashPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <CodeSharing></CodeSharing>
    </Suspense>
  )
}
export default CodeSharingHashPage
