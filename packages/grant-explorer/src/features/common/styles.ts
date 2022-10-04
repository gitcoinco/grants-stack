import tw from "tailwind-styled-components"

export const Button = tw.button`
  md:w-64
  md:h-14
  w-full
  rounded-2xl
  border-4
  border-black
  my-6
  text-2xl
  hover:bg-gray-200
  disabled:bg-slate-50
  disabled:text-slate-500
  disabled:border-slate-200
  disabled:shadow-none
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
export const CardsContainer = tw.div`
  flex
  flex-row
  flex-wrap
  w-full
`;

export const BasicCard = tw.div`
  w-[302px]
  h-[294px]
  ml-0
  mr-6
  my-3
  rounded
  bg-white
  shadow-md
  `;

export const CardHeader = tw.div`
  w-full
  h-36
  rounded-t
`;

export const CardContent = tw.div`
  p-4
  pt-0
`;

export const CardTitle = tw.p`
  w-full
  my-2
  text-sm
  font-normal
  text-ellipsis
  line-clamp-2
`;