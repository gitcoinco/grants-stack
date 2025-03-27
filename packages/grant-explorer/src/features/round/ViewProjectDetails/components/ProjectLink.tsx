import {
  ComponentPropsWithRef,
  createElement,
  FunctionComponent,
  PropsWithChildren,
} from "react";
import { VerifiedBadge } from "./VerifiedBadge";

export function ProjectLink({
  icon,
  children,
  url,
  isVerified,
}: PropsWithChildren<{
  icon: FunctionComponent<ComponentPropsWithRef<"svg">>;
  url?: string;
  isVerified?: boolean;
}>) {
  const Component = url ? "a" : "div";
  return children ? (
    <div className="flex items-center gap-2">
      <div>{createElement(icon, { className: "w-4 h-4 text-grey-400" })}</div>
      <div className="flex gap-2">
        <Component
          href={url}
          target="_blank"
          className={url && "text-blue-300 hover:underline"}
        >
          {children}
        </Component>
        {isVerified && <VerifiedBadge />}
      </div>
    </div>
  ) : null;
}
