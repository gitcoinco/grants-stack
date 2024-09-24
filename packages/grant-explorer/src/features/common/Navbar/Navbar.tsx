import { ReactComponent as GitcoinLogo } from "../../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../../assets/topbar-logos-black.svg";
import { ReactComponent as GrantsExplorerLogoMobile } from "../../../assets/explorer-logo-mobile.svg";
import NavbarCart from "./NavbarCart";
import { useEffect } from "react";
import { useCartStorage } from "../../../store";
import { Link } from "react-router-dom";
import ContributionHistoryLink from "./ContributionHistoryLink";
import AlloVersionBanner from "./AlloVersionBanner";
import { NavbarConnectButton } from "./NavbarConnectButton";
import { NavbarSeparator } from "./NavbarSeparator";
// Note: we use this during a GG round, disabling until then.
// import ExploreRoundsDropdown, {
//   ExploreRoundsDropdownProps,
// } from "./ExploreRoundsDropdown";

export interface NavbarProps {
  customBackground?: string;
  showWalletInteraction?: boolean;
  showAlloVersionBanner?: boolean;
}

export default function Navbar({
  showAlloVersionBanner = false,
  showWalletInteraction = true,
  customBackground = "",
}: NavbarProps) {
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

  // Note: we use this during a GG round, disabling until then.
  // todo: update this list with GG21 featured rounds.
  // const rounds: ExploreRoundsDropdownProps[] = [
  // example:
  //   {
  //     chainId: 42161,
  //     roundId: "26",
  //     name: "WEB3 Infrastructure",
  //     link: "/round/42161/26",
  //   },
  // ];

  return (
    <nav
      className={`blurred fixed w-full z-20 shadow-[0_4px_24px_0px_rgba(0,0,0,0.08)] ${customBackground}`}
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
                <NavbarSeparator />{" "}
                <GrantsExplorerLogo className="hidden lg:block" />
                <GrantsExplorerLogoMobile className="lg:hidden" />
              </div>
            </Link>
          </div>
          <div className="flex flex-row items-center gap-6 font-mono font-medium">
            {/* {rounds && <ExploreRoundsDropdown rounds={rounds} />} */}
            {showWalletInteraction && <NavbarConnectButton />}
            <ContributionHistoryLink />
            <NavbarCart cart={store.projects} />
          </div>
        </div>
      </div>
      {showAlloVersionBanner && (
        <div className="bg-white/40 backdrop-blur-sm p-4 text-center w-full font-medium flex flex-col items-center justify-center text-black">
          <AlloVersionBanner />
        </div>
      )}
    </nav>
  );
}
