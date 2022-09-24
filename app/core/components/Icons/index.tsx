type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
interface Props extends React.HTMLAttributes<HTMLOrSVGElement> {
  size?: Size
  className?: string
}

const sizeClassMap = new Map<Size, string>()
sizeClassMap.set("xs", "w-2 h-2")
sizeClassMap.set("sm", "w-3 h-3")
sizeClassMap.set("md", "w-4 h-4")
sizeClassMap.set("lg", "w-8 h-8")
sizeClassMap.set("xl", "w-12 h-12")

export const Link = ({ className, size = "md", ...props }: Props) => (
  <svg
    {...props}
    className={`${className} ${sizeClassMap.get(size)}`}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M618.24 439.381333a152.746667 152.746667 0 0 1 0 216l-135.893333 135.893334a163.370667 163.370667 0 1 1-231.04-231.04l66.922666-66.944 45.269334 45.269333-66.944 66.944a99.370667 99.370667 0 1 0 140.522666 140.522667l135.893334-135.893334a88.746667 88.746667 0 0 0 0-125.482666z m182.528-197.589333a163.370667 163.370667 0 0 1 0 231.04L733.866667 539.776l-45.269334-45.248 66.944-66.944a99.370667 99.370667 0 1 0-140.522666-140.522667l-135.893334 135.893334a88.746667 88.746667 0 0 0 0 125.482666l-45.269333 45.269334a152.746667 152.746667 0 0 1 0-216l135.893333-135.893334a163.370667 163.370667 0 0 1 231.04 0z"></path>
  </svg>
)
export const ArrowUp = ({ className, size = "md", ...props }: Props) => (
  <svg
    {...props}
    className={`${className} ${sizeClassMap.get(size)}`}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M500.8 461.909333L267.306667 695.296l-45.226667-45.269333 278.741333-278.613334L779.306667 650.026667l-45.248 45.226666z"></path>
  </svg>
)
export const ArrowDown = ({ className, size = "md", ...props }: Props) => (
  <svg
    {...props}
    className={`${className} ${sizeClassMap.get(size)}`}
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M500.8 604.779L267.307 371.392l-45.227 45.27 278.741 278.613L779.307 416.66l-45.248-45.248z"></path>
  </svg>
)
