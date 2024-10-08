import { PropsWithChildren } from "react";

export function NavbarActions({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center gap-6" data-testid="navbar-actions">
      {children}
    </div>
  );
}

NavbarActions.displayName = "NavbarActions";
NavbarActions.navbarSection = "main";
