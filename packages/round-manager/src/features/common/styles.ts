import tw from "tailwind-styled-components"


type ButtonProps = {
  $variant: 'solid' | 'outline'
}
export const Button = tw.button`
  bg-grey-500 text-white
  py-2.5 px-10
  rounded
  transition-colors
  focus:shadow-outline
  hover:brightness-125
  disabled:bg-slate-50
  disabled:text-slate-500
  disabled:border-slate-200
  disabled:shadow-none
  ${({ $variant }: ButtonProps) => (
    $variant === "outline" ? "bg-white text-grey-500 border" : "bg-grey-500 text-white"
  )}
`

type InputProps = {
  $hasError: boolean
}

export const Input = tw.input<InputProps>`
  block
  my-1 w-full sm:text-sm border-gray-300
  shadow-sm rounded-md
  focus:ring-indigo-500 focus:border-indigo-500 
  ${({ $hasError }: InputProps) => (
    $hasError ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500" : ""
  )}
`