import { ReactComponent as ManagerLogo } from "../../../assets/manager-logo-dark.svg";
import { ReactComponent as ManagerLogoMobile } from "../../../assets/manager-logo-mobile.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NavbarGeneric } from "common/src/components";

export interface NavbarProps {
  programCta?: boolean;
  className?: string;
}

export default function Navbar({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  programCta = true,
  className = "bg-white",
}: NavbarProps) {
  return (
    <NavbarGeneric className={className}>
      <NavbarGeneric.Logo to="/">
        <ManagerLogo className="h-8 w-auto hidden lg:block" />
        <ManagerLogoMobile className="h-8 w-auto lg:hidden" />
      </NavbarGeneric.Logo>
      <NavbarGeneric.Actions>
        <NavbarGeneric.ConnectButton>
          <ConnectButton
            showBalance={false}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            chainStatus={{ smallScreen: "icon" }}
            label="Log in"
          />
        </NavbarGeneric.ConnectButton>
      </NavbarGeneric.Actions>
    </NavbarGeneric>
  );
}
