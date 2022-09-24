import { forwardRef } from "react"

export interface CardProps {
  className?: string
  children: React.ReactNode
}

export const Card = forwardRef<HTMLInputElement, CardProps>(({ className, children }, ref) => {
  return (
    <div
      className={`shadow-sm
      hover:shadow-md
      hover:shadow-gray-600/50
    p-4 inline-block shadow-gray-500/50  ${className}`}
      ref={ref}
    >
      {children}
    </div>
  )
})

export default Card
