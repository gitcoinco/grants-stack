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
  title,
  children,
  className,
}: { action?: ReactNode; title: string } & ComponentProps<"div">) {
  return (
    <section className="py-8">
      <div
        className={classNames("flex justify-between items-center", className)}
      >
        <h3 className="text-2xl md:text-4xl font-medium tracking-tight">
          {title}
        </h3>
        <div>{action}</div>
      </div>
      <div>{children}</div>
    </section>
  );
}
