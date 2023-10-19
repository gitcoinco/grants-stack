import { PropsWithChildren, ReactNode } from "react";
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
}: { action?: ReactNode; title: string } & PropsWithChildren) {
  return (
    <section className="py-8">
      <div className="flex justify-between items-center">
        <h3 className="text-4xl font-medium tracking-tight">{title}</h3>
        <div>{action}</div>
      </div>
      <div>{children}</div>
    </section>
  );
}
