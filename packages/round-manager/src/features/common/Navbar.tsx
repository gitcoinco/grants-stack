import { Link } from "react-router-dom";
import { ReactComponent as ManagerLogoDark } from "../../assets/manager-logo.svg";
import { ReactComponent as GitcoinLogoDark } from "../../assets/gitcoinlogo-white.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export interface NavbarProps {
  programCta?: boolean;
}

export default function Navbar({ programCta: programCta = true }: NavbarProps) {
  return (
    <>
      <nav className="bg-black shadow-md z-10 w-full">
        <div className="mx-auto px-6 text-white max-w-screen-2xl">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex-shrink-0 flex items-center"
                data-testid={"home-link"}
              >
                <GitcoinLogoDark className="block h-8 w-auto" />
                <div className="hidden lg:block md:block">
                  <span className="mx-6">|</span>
                  <ManagerLogoDark className="lg:inline-block md:inline-block" />
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
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
                  chainStatus={{ smallScreen: "none", largeScreen: "none" }}
                  label="Log in"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
