import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { NavbarSeparator } from "./NavbarSeparator";
export function NavbarLogo({
  to = "",
  children,
}: PropsWithChildren<{
  to?: string;
}>) {
  return (
    <Link //NavbarLink
      to={to}
      className="flex-shrink-0 flex items-center gap-4"
      data-testid="navbar-logo"
    >
      <GitcoinLogo className="h-8 w-auto" />
      {children ? (
        <>
          <NavbarSeparator />
          {children}
        </>
      ) : null}
    </Link>
  );
}

NavbarLogo.displayName = "NavbarLogo";
NavbarLogo.navbarSection = "main";
