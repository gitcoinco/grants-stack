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
import { getAlloVersion } from "common/src/config";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import ExploreRoundsDropdown, {
  ExploreRoundsDropdownProps,
} from "./ExploreRoundsDropdown";

export interface NavbarProps {
  customBackground?: string;
  showWalletInteraction?: boolean;
  showAlloVersionBanner?: boolean;
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
  const alloVersion = getAlloVersion();

  const rounds: ExploreRoundsDropdownProps[] = [
    {
      chainId: 42161,
      roundId: "26",
      name: "WEB3 Infrastructure",
      link: "/round/42161/26",
    },
    {
      chainId: 42161,
      roundId: "27",
      name: "Developer Tooling",
      link: "/round/42161/27",
    },
    {
      chainId: 42161,
      roundId: "25",
      name: "dApps & Apps",
      link: "/round/42161/25",
    },
    {
      chainId: 42161,
      roundId: "23",
      name: "Hackathon Alumni",
      link: "/round/42161/23",
    },
    {
      chainId: 42161,
      roundId: "29",
      name: "Climate Solutions",
      link: "/round/42161/29",
    },
    {
      chainId: 42161,
      roundId: "24",
      name: "ENS",
      link: "/round/42161/24",
    },
    {
      chainId: 10,
      roundId: "9",
      name: "Token Engineering Commons (TEC)",
      link: "/round/10/9",
      customClasses: "w-[7.5rem]",
    },
    {
      chainId: 42161,
      roundId: "31",
      name: "Open Civics",
      link: "/round/42161/31",
    },
    {
      chainId: 42161,
      roundId: "28",
      name: "Hypercerts Ecosystem",
      link: "/round/42161/28",
    },
  ];

  return (
    <nav
      className={`blurred fixed w-full z-20 shadow-[0_4px_24px_0px_rgba(0,0,0,0.08)] ${props.customBackground}`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-20 max-w-screen-2xl">
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
          <div className="flex flex-row items-center gap-6 font-mono font-medium">
            {rounds && <ExploreRoundsDropdown rounds={rounds} />}
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
                    chainStatus={{ smallScreen: "icon" }}
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
      {props.showAlloVersionBanner && (
        <div className="bg-white/40 backdrop-blur-sm p-4 text-center w-full font-medium flex flex-col items-center justify-center text-black">
          <div>
            <ExclamationCircleIcon className="h-5 w-5 inline-block mr-2" />
            {alloVersion === "allo-v2" ? (
              <>
                Rounds launched before the 25th of March appear on Allo v1.
                Check out those rounds{" "}
                <a
                  className="underline"
                  target="_blank"
                  href="https://explorer-v1.gitcoin.co"
                >
                  here
                </a>
                !
              </>
            ) : (
              <>
                Rounds launched after the 24th of March appear on Allo v2. Check
                out those rounds{" "}
                <a
                  className="underline"
                  target="_blank"
                  href="https://explorer.gitcoin.co"
                >
                  here
                </a>
                !
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
