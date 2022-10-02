import { Link } from "react-router-dom";

import { ReactComponent as RoundManagerLogo } from "../../assets/topbar-logos-black.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as Search } from "../../assets/search-black.svg";
import { ReactComponent as HeartHand } from "../../assets/hearthand.svg";

export interface NavbarProps {
  programCta?: boolean;
}

export default function Navbar() {
  return (
    <nav className="bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="#" className="flex-shrink-0 flex items-center">
              <div className="hidden lg:block md:block">
                <RoundManagerLogo className="lg:inline-block md:inline-block" />
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Search />
            <HeartHand />
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
