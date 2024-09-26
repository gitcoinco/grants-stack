import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NavbarGeneric } from "common/src/components";
import { ReactComponent as GrantsExplorerLogo } from "../../../assets/topbar-logos-black.svg";
import { ReactComponent as GrantsExplorerLogoMobile } from "../../../assets/explorer-logo-mobile.svg";
import AlloVersionBanner from "./AlloVersionBanner";
import NavbarCart from "./NavbarCart";
import ContributionHistoryLink from "./ContributionHistoryLink";

export interface NavbarProps {
  showWalletInteraction?: boolean;
  showAlloVersionBanner?: boolean;
  className?: string;
}

export default function Navbar({
  showWalletInteraction = true,
  showAlloVersionBanner = false,
  className,
}: NavbarProps) {
  return (
    <NavbarGeneric
      blurred
      fixed
      showWalletInteraction={showWalletInteraction}
      showBanner={showAlloVersionBanner}
      className={className}
    >
      <NavbarGeneric.Logo to="/">
        <GrantsExplorerLogo className="h-8 w-auto hidden lg:block" />
        <GrantsExplorerLogoMobile className="h-8 w-auto lg:hidden" />
      </NavbarGeneric.Logo>
      <NavbarGeneric.Actions>
        <NavbarGeneric.ConnectButton>
          <ConnectButton
            showBalance={false}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            label="Connect wallet"
            chainStatus={{ smallScreen: "icon" }}
          />
        </NavbarGeneric.ConnectButton>
        <div className="flex items-center gap-4">
          <ContributionHistoryLink />
          <NavbarCart />
        </div>
      </NavbarGeneric.Actions>
      <NavbarGeneric.Banner>
        <AlloVersionBanner />
      </NavbarGeneric.Banner>
    </NavbarGeneric>
  );
}
