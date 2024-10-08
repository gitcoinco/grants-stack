import React, { PropsWithChildren, ReactElement } from "react";
import { NavbarBanner } from "./NavbarBanner";
import { NavbarCustomAction } from "./NavbarCustomAction";
import { NavbarConnectButton } from "./NavbarConnectButton";
import { NavbarActions } from "./NavbarActions";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarProvider } from "./NavbarContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavbarSubComponent = React.ComponentType<any> & {
  displayName?: string;
  navbarSection?: "main" | "banner";
};

function isNavbarSubComponent(
  child: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): child is ReactElement<any, NavbarSubComponent> {
  return (
    React.isValidElement(child) &&
    typeof child.type === "function" &&
    "displayName" in child.type
  );
}

function filterNavbarSubComponentsBySection(
  children: React.ReactNode,
  section: "main" | "banner"
): React.ReactNode {
  return React.Children.toArray(children).filter(
    (child) =>
      isNavbarSubComponent(child) && child.type.navbarSection === section
  );
}

type NavbarGenericProps = PropsWithChildren<{
  className?: string;
  showWalletInteraction?: boolean;
  showBanner?: boolean;
  fixed?: boolean;
  blurred?: boolean;
}>;

export function NavbarGeneric({
  children,
  fixed = false,
  blurred = false,
  className = "",
  showWalletInteraction = true,
  showBanner = false,
}: NavbarGenericProps) {
  const mainComponents = filterNavbarSubComponentsBySection(children, "main");
  const bannerComponent = filterNavbarSubComponentsBySection(
    children,
    "banner"
  );

  return (
    <NavbarProvider value={{ showWalletInteraction, showBanner }}>
      <header className="w-full mb-3" data-testid="navbar-container">
        <nav
          className={`w-full z-20 shadow-md  ${className} ${
            fixed ? "fixed" : ""
          } ${blurred ? "blurred" : ""}`}
          data-testid="navbar"
        >
          <div className="h-16 mx-auto py-[10px] px-4 sm:px-6 lg:px-20 flex justify-between items-center">
            {mainComponents}
          </div>
          {bannerComponent}
        </nav>
      </header>
    </NavbarProvider>
  );
}

NavbarGeneric.Logo = NavbarLogo;

// Actions component for right-side items
NavbarGeneric.Actions = NavbarActions;

NavbarGeneric.ConnectButton = NavbarConnectButton;

NavbarGeneric.CustomAction = NavbarCustomAction;

NavbarGeneric.Banner = NavbarBanner;

NavbarGeneric.displayName = "NavbarGeneric";
