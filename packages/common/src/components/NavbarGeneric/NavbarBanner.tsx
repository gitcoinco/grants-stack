import { ReactElement } from "react";
import { useNavbarContext } from "./NavbarContext";

export function NavbarBanner({ children }: { children: ReactElement }) {
  const { showBanner } = useNavbarContext();
  if (!showBanner) return null;
  return (
    <div
      className="bg-white/40 backdrop-blur-sm text-center w-full font-medium flex flex-col items-center justify-center text-black"
      data-testid="navbar-banner"
    >
      {children}
    </div>
  );
}

NavbarBanner.displayName = "NavbarBanner";
NavbarBanner.navbarSection = "banner";
