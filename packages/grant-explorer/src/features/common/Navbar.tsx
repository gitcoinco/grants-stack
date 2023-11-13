import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import NavbarCart from "./NavbarCart";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useCartStorage } from "../../store";
import { Link } from "react-router-dom";
import { PassportWidget } from "./PassportWidget";
import { PGN as PGNLogoIcon } from "common/src/icons/PGN";
import { PGNText as PGNTextLogoIcon } from "common/src/icons/PGNText";

export interface NavbarProps {
  customBackground?: string;
  showWalletInteraction?: boolean;
}

export default function Navbar(props: NavbarProps) {
  /** This part keeps the store in sync between tabs */
  const store = useCartStorage();

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
  /** end of part that keeps the store in sync between tabs */

  const showWalletInteraction = props.showWalletInteraction ?? true;

  const { address: walletAddress } = useAccount();

  return (
    <nav
      className={`bg-white/5 backdrop-blur-md fixed w-full z-20 shadow-[0_4px_24px_0px_rgba(0,0,0,0.08)] ${props.customBackground}`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to={"/"}
              className="flex-shrink-0 flex items-center"
              data-testid={"home-link"}
            >
              <GitcoinLogo className="block h-8 w-auto" />
              <div className="hidden lg:block md:block">
                <span className="mx-6 text-grey-400">|</span>
                <GrantsExplorerLogo className="lg:inline-block md:inline-block" />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <a
                href="https://bridge.gitcoin.co"
                rel="noreferrer"
                target="_blank"
                className="flex-shrink-0 flex items-center"
              >
                <PGNLogoIcon className="mr-2" />
                <PGNTextLogoIcon fill="black" />
              </a>
            </div>
            <Link to="/rounds" className="font-medium hover:underline">
              Explore rounds
            </Link>
            {walletAddress && (
              <div data-testid="passport-widget">
                <PassportWidget />
              </div>
            )}
            {showWalletInteraction && (
              <div>
                <div
                  data-testid="connect-wallet-button"
                  id="connect-wallet-button"
                >
                  <ConnectButton
                    showBalance={false}
                    accountStatus={{
                      smallScreen: "avatar",
                      largeScreen: "full",
                    }}
                    chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
                  />
                </div>
              </div>
            )}
            {walletAddress && (
              <div>
                <Link
                  to={`/contributors/${walletAddress}`}
                  className="flex-shrink-0 flex items-center"
                  data-testid={"contributions-link"}
                >
                  <UserCircleIcon className="h-8 w-8" />
                </Link>
              </div>
            )}
            <NavbarCart cart={store.projects} />
          </div>
        </div>
      </div>
    </nav>
  );
}
