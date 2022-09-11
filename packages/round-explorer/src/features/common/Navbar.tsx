import { Link } from "react-router-dom"

import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-white.svg"
import { ReactComponent as RoundManagerLogo } from "../../assets/round-manager-logo.svg"
import { ConnectButton } from "@rainbow-me/rainbowkit"


export interface NavbarProps {
  programCta?: boolean;
}


export default function Navbar() {

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
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}