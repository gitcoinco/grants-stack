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
  w-[296px]
  h-[374px]
  ml-0
  mx-0
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
  line-clamp-4
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
