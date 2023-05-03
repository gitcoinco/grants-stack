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
  rounded
  bg-white
  shadow-md
  `;

export const CardHeader = tw.div`
  w-full
  rounded-t
`;

export const CardContent = tw.div`
  p-4
  pt-0
`;

export const CardTitle = tw.p`
  w-full
  mt-[10px]
  md:mt-[16px]
  2xl:mt-[10px]
  text-[16px]
  font-normal
  text-ellipsis
  line-clamp-2
`;

export const CardDescription = tw.p`
  md:mt-2
  text-[12px]
  md:text-[14px]
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
