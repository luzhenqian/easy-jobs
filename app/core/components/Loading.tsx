import { Spinner } from "@chakra-ui/react"

export const Loading = () => (
  <div className="flex justify-center items-center flex-col m-auto">
    <Spinner color="green.300" />
    <div className="text-sm">加载中...</div>
  </div>
)

export default Loading
