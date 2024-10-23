import React from "react";

export const ImageWithLoading = ({
  src,
  sizeClass = "w-[400px] h-[400px]",
  isLoading,
  ...props
}: {
  src: string | undefined;
  sizeClass?: string;
  isLoading: boolean;
} & React.HTMLProps<HTMLDivElement>) => {
  // Handle loading and blur states
  const loadingClass = isLoading ? "animate-pulse bg-gray-100" : "";
  const blurClass = !src ? "blur-[40px]" : "";

  return (
    <div
      {...props}
      className={`bg-cover bg-center bg-transparent  ${sizeClass} ${blurClass} ${loadingClass}`}
      style={{ backgroundImage: `url("${src || ""}")` }} // Use src if available, otherwise keep it empty
    />
  );
};
