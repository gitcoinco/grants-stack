import React, { useEffect, useState } from "react";

export const ImageWithLoading = ({
  src,
  sizeClass = "size-[400px]",
  isLoading,
  style,
  onAspectRatioChange,
  ...props
}: {
  src: string | undefined;
  sizeClass?: string;
  isLoading: boolean;
  style?: React.CSSProperties;
  onAspectRatioChange?: (ratio: string) => void;
} & React.HTMLProps<HTMLDivElement>) => {
  const [aspectRatio, setAspectRatio] = useState("2/1");
  const loadingClass = isLoading ? "animate-pulse bg-gray-100" : "";
  const blurClass = !src ? "blur-[40px]" : "";

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => {
        console.log("img.width", img.width);
        console.log("img.height", img.height);

        const ratio = `${img.width}/${img.height}`;
        console.log("ratio", ratio);
        setAspectRatio(ratio);
        onAspectRatioChange?.(ratio);
      };
      img.src = src;
    }
  }, [src, onAspectRatioChange]);

  return (
    <div
      {...props}
      className={`bg-cover bg-center bg-no-repeat bg-transparent ${sizeClass} ${blurClass} ${loadingClass}`}
      style={{
        backgroundImage: `url("${src || ""}")`,
        aspectRatio,
        objectFit: "contain",
        height: "300px",
        ...style,
      }}
    />
  );
};
