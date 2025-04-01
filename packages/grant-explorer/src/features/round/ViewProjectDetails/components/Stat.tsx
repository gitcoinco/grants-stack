import { ComponentProps } from "react";
import { Skeleton } from "@chakra-ui/react";

export function Stat({
  value,
  children,
  isLoading,
  className,
}: {
  value?: string | number | null;
  isLoading?: boolean;
} & ComponentProps<"div">) {
  return (
    <div className={`flex flex-col ${className}`}>
      <Skeleton isLoaded={!isLoading} height={"36px"}>
        <h4 className="text-3xl">{value}</h4>
      </Skeleton>
      <span className="text-sm md:text-base">{children}</span>
    </div>
  );
}
