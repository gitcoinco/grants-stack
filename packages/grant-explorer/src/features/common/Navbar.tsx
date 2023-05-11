import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import { useCart } from "../../context/CartContext";
import CustomerSupport from "./CustomerSupport";
import NavbarCart from "./NavbarCart";

export interface NavbarProps {
  roundUrlPath: string;
  customBackground?: string;
  isBeforeRoundEndDate?: boolean;
  showWalletInteraction?: boolean;
}

export default function Navbar(props: NavbarProps) {
  const [cart] = useCart();
  const showWalletInteraction = props.showWalletInteraction ?? true;
  const currentOrigin = window.location.origin;

  return (
    <nav className={`bg-white fixed w-full z-10 ${props.customBackground}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <a
              href={`${currentOrigin}#${props.roundUrlPath}`}
              className="flex-shrink-0 flex items-center"
              data-testid={"home-link"}
            >
              <GitcoinLogo className="block h-8 w-auto" />
              <div className="hidden lg:block md:block">
                <span className="mx-6 text-grey-400">|</span>
                <GrantsExplorerLogo className="lg:inline-block md:inline-block" />
              </div>
            </a>
          </div>
          <div className="flex items-center gap-6">
            {showWalletInteraction && (
              <div>
                <div
                  data-testid="connect-wallet-button"
                  id="connect-wallet-button"
                >
                  <ConnectButton />
                </div>
              </div>
            )}
            {props.isBeforeRoundEndDate && (
              <NavbarCart cart={cart} roundUrlPath={props.roundUrlPath} />
            )}
            <CustomerSupport />
          </div>
        </div>
      </div>
    </nav>
  );
}
