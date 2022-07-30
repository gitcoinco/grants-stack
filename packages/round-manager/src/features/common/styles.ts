import tw from "tailwind-styled-components"


type ButtonProps = {
  $variant: 'solid' | 'outline'
}
export const Button = tw.button`
  bg-violet-400 text-white
  py-2.5 px-10
  rounded
  transition-colors
  focus:shadow-outline
  hover:brightness-125
  disabled:bg-slate-100
  disabled:text-slate-500
  disabled:border-slate-200
  disabled:shadow-none
  ${(p: ButtonProps) => (
    p.$variant === "outline" ? "bg-white text-grey-500 border border-grey-100" : "bg-violet-400 text-white"
  )}
`

type InputProps = {
  $hasError: boolean
  $disabled: boolean
}

export const Input = tw.input<InputProps>`
  block
  my-1 w-full sm:text-sm border-grey-100
  shadow-sm rounded-md
  ${(p: InputProps) => (
    p.$hasError ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
      : "focus:ring-indigo-500 focus:border-indigo-500"
  )}
  ${(p: InputProps) => (
    p.$disabled && "bg-[#F1F1F1]"
  )}
`

export const ProjectCardsContainer = tw.div`
  flex
  flex-row
  flex-wrap
  w-full
`

export const ProjectCard = tw.div`
  w-80
  h-72
  border
  border-gray-300
  ml-0
  mr-6
  my-3
  overflow-hidden
  rounded-md
`

export const ProjectCardHeader = tw.div`
  bg-grey-500
  w-full
  h-1/3
`

export const ProjectCardContent = tw.div`
  p-4
`

export const ProjectCardTitle = tw.p`
  w-full
  my-4
  text-lg
  font-normal
  text-ellipsis
  line-clamp-2
`

export const ProjectCardDescription = tw.p`
  text-sm
  text-ellipsis
  line-clamp-2
  text-gray-500
  leading-relaxed
`