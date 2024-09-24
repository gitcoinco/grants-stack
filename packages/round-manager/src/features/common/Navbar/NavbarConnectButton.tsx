import { ConnectButton } from "@rainbow-me/rainbowkit";

export function NavbarConnectButton() {
  return (
    <div data-testid="connect-wallet-button" id="connect-wallet-button">
      <ConnectButton
        showBalance={false}
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
        label="Log in"
      />
    </div>
  );
}
