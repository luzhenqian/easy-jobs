import { Suspense } from "react"
import CodeSharing from "app/code-sharings/components/CodeSharing"
import PageLoading from "app/core/components/PageLoading"

const CodeSharingPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <CodeSharing></CodeSharing>
    </Suspense>
  )
}
export default CodeSharingPage
