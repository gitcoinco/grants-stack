import { Link } from "react-router-dom";
import { PlusSmIcon } from "@heroicons/react/solid";

import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-white.svg";
import { ReactComponent as RoundManagerLogo } from "../../assets/round-manager-logo.svg";
import { Button } from "../common/styles";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export interface NavbarProps {
  programCta?: boolean;
}

export default function Navbar({ programCta = true }: NavbarProps) {
  return (
    <nav className="bg-grey-500">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <GitcoinLogo className="block h-8 w-auto" />
              <div className="hidden lg:block md:block">
                <span className="mx-6 text-grey-400">|</span>
                <RoundManagerLogo className="lg:inline-block md:inline-block" />
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {programCta && (
                <Link to="/program/create">
                  <Button
                    $variant="solid"
                    type="button"
                    className="inline-flex items-center px-4 py-1.5 shadow-sm text-sm rounded"
                  >
                    <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                    Create Program
                  </Button>
                </Link>
              )}
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
