import { Link, useParams } from "react-router-dom";
import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCart } from "../../context/CartContext";
import CustomerSupport from "./CustomerSupport";

export interface NavbarProps {
  roundUrlPath: string;
  customBackground?: string;
}

export default function Navbar(props: NavbarProps) {
  const [cart] = useCart();
  const { chainId, roundId } = useParams();

  return (
    <nav className={`bg-white fixed w-full z-10 ${props.customBackground}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to={`/round/${chainId}/${roundId}`}
              className="flex-shrink-0 flex items-center"
              data-testid={"home-link"}
            >
              <GitcoinLogo className="block h-8 w-auto" />
              <div className="hidden lg:block md:block">
                <span className="mx-6 text-grey-400">|</span>
                <GrantsExplorerLogo className="lg:inline-block md:inline-block" />
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div id="connect-wallet-button">
              <ConnectButton />
            </div>
            <Cart
              count={cart.length}
              roundUrlPath={props.roundUrlPath}
            />
            <CustomerSupport />
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Cart(props: { count: number; roundUrlPath: string }) {
  return (
    <span className="relative inline-block">
      <Link to={`${props.roundUrlPath}/cart`} data-testid={"cart"}>

        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 7H3L3.4 9M5 17H15L19 9H3.4M5 17L3.4 9M5 17L2.70711 19.2929C2.07714 19.9229 2.52331 21 3.41421 21H15M15 21C13.8954 21 13 21.8954 13 23C13 24.1046 13.8954 25 15 25C16.1046 25 17 24.1046 17 23C17 21.8954 16.1046 21 15 21ZM7 23C7 24.1046 6.10457 25 5 25C3.89543 25 3 24.1046 3 23C3 21.8954 3.89543 21 5 21C6.10457 21 7 21.8954 7 23Z" stroke="#0E0333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          { props.count ? <circle cx="18" cy="8" r="8" fill="#6F3FF5"/> : null }
        </svg>

        {Boolean(props.count) && (
          <div
            className="inline-flex absolute top-0.5 pt-0.5 pl-1 left-2 justify-center items-center w-4 h-3 text-white"
            style={{
              fontSize: 7.5,
            }}
          >
            {props.count}
          </div>
        )}
      </Link>
    </span>
  );
}
