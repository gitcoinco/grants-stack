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
            <Cart
              count={cart.length}
              roundUrlPath={props.roundUrlPath}
            />
            <div id="connect-wallet-button">
              <ConnectButton />
            </div>
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
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1H3L3.4 3M5 11H15L19 3H3.4M5 11L3.4 3M5 11L2.70711 13.2929C2.07714 13.9229 2.52331 15 3.41421 15H15M15 15C13.8954 15 13 15.8954 13 17C13 18.1046 13.8954 19 15 19C16.1046 19 17 18.1046 17 17C17 15.8954 16.1046 15 15 15ZM7 17C7 18.1046 6.10457 19 5 19C3.89543 19 3 18.1046 3 17C3 15.8954 3.89543 15 5 15C6.10457 15 7 15.8954 7 17Z"
            stroke="#0E0333"
          />

          {props.count ? <circle cx="16" cy="10" r="8" fill="#6F3FF5" /> : null}
        </svg>

        {Boolean(props.count) && (
          <div
            className="inline-flex absolute top-1 left-2 justify-center items-center w-4 h-3 text-white"
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
