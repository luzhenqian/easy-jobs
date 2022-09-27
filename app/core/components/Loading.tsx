import { Spinner } from "@chakra-ui/react"

export const Loading = ({ className }: { className?: string }) => (
  <div className={`flex justify-center items-center flex-col m-auto ${className}`}>
    <Spinner color="blue.400" />
    <div className="text-sm">加载中...</div>
  </div>
)

export default Loading
