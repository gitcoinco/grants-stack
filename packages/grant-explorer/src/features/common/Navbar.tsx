import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import { ReactComponent as GrantsExplorerLogoMobile } from "../../assets/explorer-logo-mobile.svg";
import NavbarCart from "./NavbarCart";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useCartStorage } from "../../store";
import { Link } from "react-router-dom";
import { PassportWidget } from "./PassportWidget";
import { exploreRoundsLink } from "../discovery/LandingTabs";

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
      className={`blurred fixed w-full z-20 shadow-[0_4px_24px_0px_rgba(0,0,0,0.08)] ${props.customBackground}`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to={"/"}
              className="flex-shrink-0 flex items-center"
              data-testid={"home-link"}
            >
              <div className="flex gap-1 lg:gap-3 items-center">
                <GitcoinLogo className="" />
                <div className="border-grey-400 border-2 h-4 border-r ml-[2px]" />
                <GrantsExplorerLogo className="hidden lg:block" />
                <GrantsExplorerLogoMobile className="lg:hidden" />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to={exploreRoundsLink}
              className="font-medium hover:underline hidden md:block"
            >
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
                  className="flex-shrink-0 flex items-center ph-no-capture"
                  data-testid={"contributions-link"}
                >
                  <UserCircleIcon className="h-8 w-8 ph-no-capture" />
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
