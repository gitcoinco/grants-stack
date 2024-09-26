import { PropsWithChildren } from "react";

export function NavbarCustomAction({
  children,
  testId,
}: PropsWithChildren<{
  testId?: string;
}>) {
  return (
    <div
      className="flex items-center"
      data-testid={testId || "navbar-custom-action"}
    >
      {children}
    </div>
  );
}

NavbarCustomAction.displayName = "NavbarCustomAction";
NavbarCustomAction.navbarSection = "main";
