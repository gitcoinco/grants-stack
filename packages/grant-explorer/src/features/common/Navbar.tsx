import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import { useCart } from "../../context/CartContext";
import NavbarCart from "./NavbarCart";
import { reloadPageOnLocalStorageEvent } from "../api/LocalStorage";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export interface NavbarProps {
  roundUrlPath: string;
  customBackground?: string;
  isBeforeRoundEndDate?: boolean;
  showWalletInteraction?: boolean;
}

export default function Navbar(props: NavbarProps) {
  const [cart] = useCart();
  const showWalletInteraction = props.showWalletInteraction ?? true;
  const currentOrigin = window.location.origin;

  const { address: walletAddress } = useAccount();

  useEffect(() => {
    const storageEventHandler = (event: StorageEvent) =>
      reloadPageOnLocalStorageEvent(event);

    window.addEventListener("storage", storageEventHandler);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("storage", storageEventHandler);
    };
  });

  return (
    <nav className={`bg-white fixed w-full z-10 ${props.customBackground}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <a
              href={`${currentOrigin}#${props.roundUrlPath}`}
              className="flex-shrink-0 flex items-center"
              data-testid={"home-link"}
            >
              <GitcoinLogo className="block h-8 w-auto" />
              <div className="hidden lg:block md:block">
                <span className="mx-6 text-grey-400">|</span>
                <GrantsExplorerLogo className="lg:inline-block md:inline-block" />
              </div>
            </a>
          </div>
          <div className="flex items-center gap-6">
            {showWalletInteraction && (
              <div>
                <div
                  data-testid="connect-wallet-button"
                  id="connect-wallet-button"
                >
                  <ConnectButton
                    showBalance={false}
                    chainStatus={{ largeScreen: "icon", smallScreen: "icon" }}
                  />
                </div>
              </div>
            )}
            {walletAddress && (
              <div>
                <a
                  href={`${currentOrigin}#/contributors/${walletAddress}`}
                  className="flex-shrink-0 flex items-center"
                  data-testid={"contributions-link"}
                >
                  <UserCircleIcon className="h-8 w-8" />
                </a>
              </div>
            )}
            <NavbarCart cart={cart} roundUrlPath={props.roundUrlPath} />
          </div>
        </div>
      </div>
    </nav>
  );
}
