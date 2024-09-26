import { PropsWithChildren } from "react";
import { useNavbarContext } from "./NavbarContext";

export function NavbarConnectButton({ children }: PropsWithChildren) {
  const { showWalletInteraction } = useNavbarContext();

  if (!showWalletInteraction) return null;

  return (
    <div data-testid="connect-wallet-button" id="connect-wallet-button">
      {children}
    </div>
  );
}

NavbarConnectButton.displayName = "NavbarConnectButton";
NavbarConnectButton.navbarSection = "main";
