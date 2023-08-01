import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import NavbarCart from "./NavbarCart";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useCartStorage } from "../../store";
import { deepEqual } from "@wagmi/core";
import { useCart } from "../../context/CartContext";

export interface NavbarProps {
  roundUrlPath: string;
  customBackground?: string;
  isBeforeRoundEndDate?: boolean;
  showWalletInteraction?: boolean;
}

export default function Navbar(props: NavbarProps) {
  const store = useCartStorage();
  const showWalletInteraction = props.showWalletInteraction ?? true;
  const currentOrigin = window.location.origin;

  const { address: walletAddress } = useAccount();

  const updateStore = () => {
    useCartStorage.persist.rehydrate();
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", updateStore);
    window.addEventListener("focus", updateStore);
    return () => {
      document.removeEventListener("visibilitychange", updateStore);
      window.removeEventListener("focus", updateStore);
    };
  }, []);

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
            <NavbarCart cart={store.projects} />
          </div>
        </div>
      </div>
    </nav>
  );
}
