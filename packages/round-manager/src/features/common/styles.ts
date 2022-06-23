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
    $variant == "outline" ? "bg-white text-grey-500 border" : "bg-grey-500 text-white"
  )}
`

type TextInputProps = {
  $hasError: boolean
}

export const TextInput = tw.input<TextInputProps>`
  md:w-96
  md:h-14
  w-full
  border-4
  border-black
  px-2
  my-4
  text-2xl
  ${(p: TextInputProps) => (
    p.$hasError ? "focus:outline-none focus:border-none focus:ring focus:ring-rose-600" : ""
  )}
`