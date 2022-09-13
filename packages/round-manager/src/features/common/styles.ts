import tw from "tailwind-styled-components";

type ButtonProps = {
  $variant?: "solid" | "outline";
};

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
  ${(p: ButtonProps) =>
    p.$variant === "outline"
      ? "bg-white text-grey-500 border border-grey-100"
      : "bg-violet-400 text-white"}
`;

type InputProps = {
  $hasError?: any;
  $disabled?: any;
};

export const Input = tw.input<InputProps>`
  block
  mt-1 mb-2 w-full sm:text-sm border-grey-100
  shadow-sm rounded-md
  ${(p: InputProps) =>
    p.$hasError
      ? "border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
      : "focus:ring-violet-400 focus:border-violet-400"}
  ${(p: InputProps) => (p.$disabled ? "bg-[#F1F1F1]" : "")}
`;

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

export const CardDescription = tw.p`
  text-xs
  text-ellipsis
  line-clamp-2
  text-grey-400
  leading-relaxed
`;

export const CardFooter = tw.div`
  absolute
  bottom-0
  inset-x-0
  bg-zinc-50
  h-16
  w-full
`;

export const CardFooterContent = tw.div`
  flex
  flex-row
  items-center
  h-full
  w-full
  `;
