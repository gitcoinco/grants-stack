import { Link } from "react-router-dom";
import { PlusSmIcon } from "@heroicons/react/solid";
import { PGN as PGNLogoIcon } from "common/src/icons/PGN";
import { PGNText as PGNTextLogoIcon } from "common/src/icons/PGNText";
import { ReactComponent as ManagerLogoDark } from "../../assets/manager-logo-dark.svg";
import { ReactComponent as GitcoinLogoDark } from "../../assets/gitcoin-logo-dark.svg";
import { Button } from "common/src/styles";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export interface NavbarProps {
  programCta?: boolean;
}

export default function Navbar({ programCta = true }: NavbarProps) {
  return (
    <nav className="bg-moon-600">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-20"
        style={{
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center"
              data-testid={"home-link"}
            >
              <GitcoinLogoDark className="block h-8 w-auto" />
              <div className="hidden lg:block md:block">
                <span className="mx-6 text-grey-400">|</span>
                <ManagerLogoDark className="lg:inline-block md:inline-block" />
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {programCta && (
                <Link to="/program/create" data-testid={"program-create"}>
                  <Button
                    $variant="solid"
                    type="button"
                    className="inline-flex items-center px-4 py-1.5 shadow-sm text-sm rounded"
                    data-testid={"create-program"}
                  >
                    <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                    Create Program
                  </Button>
                </Link>
              )}
            </div>
            <ConnectButton />
            <div>
              <a
                href="https://bridge.gitcoin.co"
                rel="noreferrer"
                target="_blank"
                className="flex-shrink-0 flex items-center"
              >
                <PGNLogoIcon className="mr-2" />
                <PGNTextLogoIcon fill="white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
