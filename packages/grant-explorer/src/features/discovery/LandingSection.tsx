import { classNames } from "common";
import { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";
import tw from "tailwind-styled-components";

export const ViewAllLink = tw(Link)`
font-mono
text-sm
`;

export function LandingSection({
  action,
  left,
  title,
  children,
  className,
}: {
  left?: ReactNode;
  action?: ReactNode;
  title: string;
} & ComponentProps<"div">) {
  return (
    <section className="pt-12 pb-16">
      <div
        className={classNames(
          "flex justify-between items-center  mb-8",
          className
        )}
      >
        {left}
        {title && (
          <h3 className="text-xl md:text-3xl font-medium tracking-tight">
            {title}
          </h3>
        )}
        <div>{action}</div>
      </div>
      <div>{children}</div>
    </section>
  );
}
