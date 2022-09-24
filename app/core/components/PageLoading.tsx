import { Spinner } from "@chakra-ui/react"
import Loading from "./Loading"

export const PageLoading = () => (
  <div className="flex justify-center items-center flex-col w-screen h-screen">
    <Loading />
  </div>
)

export default PageLoading
