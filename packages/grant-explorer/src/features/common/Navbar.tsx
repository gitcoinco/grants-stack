import { Link } from "react-router-dom";

import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as Search } from "../../assets/search-black.svg";
import { ReactComponent as HeartHand } from "../../assets/hearthand.svg";

export interface NavbarProps {
  roundUrlPath: string;
}

export default function Navbar(props: NavbarProps) {
  return (
    <nav className="bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="#" className="flex-shrink-0 flex items-center">
                  <GitcoinLogo className="block h-8 w-auto" />
                <div className="hidden lg:block md:block">
                    <span className="mx-6 text-grey-400">|</span>
                    <GrantsExplorerLogo className="lg:inline-block md:inline-block" />
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Search />
              <Link to={`${props.roundUrlPath}/ballot`}>
                  <HeartHand />
                </Link>
              <ConnectButton />
            </div>
          </div>
      </div>
    </nav>
  );
}
