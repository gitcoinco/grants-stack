import { ReactComponent as ManagerLogoDark } from "../../assets/manager-logo-dark.svg";
import { ReactComponent as GitcoinLogoDark } from "../../assets/gitcoin-logo.svg";
import Navbar from "common/src/components/Navbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";

export default function ManagerNavbar() {
  const classNames = [
    "bg-white drop-shadow-md z-10 w-full bg-grey-50",
    "container mx-auto px-4 sm:px-6 lg:px-20 flex flex-wrap items-center justify-between",
    "flex flex-wrap justify-between h-16",
  ];
  return (
    <Navbar
      classNames={classNames}
      ConnectWalletItem={
        <div className="flex items-center gap-4">
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
        </div>
      }
      logo={
        <div className="flex">
          <Link
            to="/"
            className="flex-shrink-0 flex items-center"
            data-testid={"home-link"}
          >
            <GitcoinLogoDark className="block h-8 w-auto" />
            <div className="hidden lg:block md:block">
              <span className="mx-6 text-black">|</span>
              <ManagerLogoDark className="lg:inline-block md:inline-block" />
            </div>
          </Link>
        </div>
      }
    />
  );
}
