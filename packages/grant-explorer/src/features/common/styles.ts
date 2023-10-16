import tw from "tailwind-styled-components";

export const CardsContainer = tw.div`
  flex
  gap-5
  justify-around
  md:justify-start
  flex-row
  flex-wrap
  w-full
`;

export const BasicCard = tw.div`
  w-[343px]
  ml-0
  mx-0
  my-3
  rounded-3xl
  bg-white
  shadow-lg
  `;

export const CardHeader = tw.div`
  w-full
  rounded-t-3xl
`;

export const CardContent = tw.div`
  p-4
  space-y-4
`;

export const CardTitle = tw.p`
  w-full
  text-[24px]
  font-medium
  text-ellipsis
  line-clamp-1
  text-white
`;

export const CardDescription = tw.p`
  text-sm
  md:text-base
  text-ellipsis
  line-clamp-4
  text-grey-400
  leading-relaxed
`;

export const CardFooter = tw.div`
  absolute
  bottom-0
  inset-x-0
  bg-zinc-50
  h-20
  w-full
`;

export const CardFooterContent = tw.div`
  flex
  flex-row
  items-center
  h-full
  w-full
  `;

const colorMap = {
  blue: "bg-blue-100",
  green: "bg-green-100",
  grey: "bg-grey-100",
} as const;

const roundedMap = {
  full: "rounded-full",
  lg: "rounded-lg",
} as const;

export const Badge = tw.div<{
  color?: keyof typeof colorMap;
  rounded?: keyof typeof roundedMap;
  disabled?: boolean;
}>`
  font-mono
  text-xs
  text-gray-900
  bg-gray-100
  whitespace-nowrap
  inline-flex
  items-center
  justify-center
  px-2
  py-1.5
  ${(p) => colorMap[p.color ?? "grey"]}
  ${(p) => roundedMap[p.rounded ?? "lg"]}
  ${(p) => (p.disabled ? "opacity-50" : "")}
  `;
