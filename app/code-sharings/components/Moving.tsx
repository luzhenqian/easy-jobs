import { MouseEventHandler } from "react"

export function Moving({
  onMoveEnd,
  onMoveStart,
  direction,
}: {
  onMoveEnd: MouseEventHandler<HTMLDivElement>
  onMoveStart: MouseEventHandler<HTMLDivElement>
  direction: "row" | "col"
}) {
  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-50 ${
        direction === "row" ? "cursor-row-resize" : "cursor-col-resize"
      }`}
      onMouseMove={onMoveStart}
      onMouseUp={onMoveEnd}
    ></div>
  )
}
