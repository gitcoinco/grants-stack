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

  // todo: OP not justifying?? the image
  // WEB3 Infra: https://builder.gitcoin.co/#/chains/42161/rounds/26
  // Developer Tooling: https://builder.gitcoin.co/#/chains/42161/rounds/27
  // dApps & Apps: https://builder.gitcoin.co/#/chains/42161/rounds/25
  // Hackathon Alumni: https://builder.gitcoin.co/#/chains/42161/rounds/23
  // Climate Solutions: https://builder.gitcoin.co/#/chains/42161/rounds/29
  // ENS: https://builder.gitcoin.co/#/chains/42161/rounds/24
  // Token Engineering Commons (TEC): https://builder.gitcoin.co/#/chains/10/rounds/9
  // Open Civics: https://builder.gitcoin.co/#/chains/42161/rounds/31
  // Hypercerts Ecosystem: https://builder.gitcoin.co/#/chains/42161/rounds/28
  const rounds: ExploreRoundsDropdownProps[] = [
    {
      chainId: 42161,
      name: "WEB3 Infrastructurre",
      link: "",
    },
    {
      chainId: 42161,
      name: "Developer Tooling",
      link: "",
    },
    {
      chainId: 42161,
      name: "dApps & Apps",
      link: "",
    },
    {
      chainId: 42161,
      name: "Hackathon Alumni",
      link: "",
    },
    {
      chainId: 42161,
      name: "Climate Solutions",
      link: "",
    },
    {
      chainId: 42161,
      name: "ENS",
      link: "",
    },
    {
      chainId: 10,
      name: "Token Engineering Commons (TEC)",
      link: "",
    },
    {
      chainId: 42161,
      name: "Open Civics",
      link: "",
    },
    {
      chainId: 42161,
      name: "Hypercerts Ecosystem",
      link: "",
    },
  ];

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

          <div className="flex flex-row items-center gap-6 font-mono font-medium">
            {/* todo: pass the rounds: RoundsGetRounds[] to the <ExploreRoundsDropdown rounds={[]} /> */}
            <ExploreRoundsDropdown rounds={rounds} />
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
