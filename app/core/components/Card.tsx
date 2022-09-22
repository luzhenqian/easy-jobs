import { forwardRef } from "react"

export interface CardProps {
  className?: string
  children: React.ReactNode
}

export const Card = forwardRef<HTMLInputElement, CardProps>(({ className, children }, ref) => {
  return (
    <div className={`shadow-sm p-4 inline-block shadow-gray-500/50  ${className}`} ref={ref}>
      {children}
    </div>
  )
})

export default Card
