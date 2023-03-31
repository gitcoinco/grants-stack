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
  const [shortlist] = useCart();
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
            <Shortlist
              count={shortlist.length}
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

export function Shortlist(props: { count: number; roundUrlPath: string }) {
  return (
    <span className="relative inline-block">
      <Link to={`${props.roundUrlPath}/ballot`} data-testid={"ballot"}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 7V19H17V7H15ZM14 20H4V22H14V20ZM3 19V7H1V19H3ZM4 6H6V4H4V6ZM12 6H14V4H12V6ZM4 20C3.44772 20 3 19.5523 3 19H1C1 20.6569 2.34315 22 4 22V20ZM15 19C15 19.5523 14.5523 20 14 20V22C15.6569 22 17 20.6569 17 19H15ZM17 7C17 5.34315 15.6569 4 14 4V6C14.5523 6 15 6.44772 15 7H17ZM3 7C3 6.44772 3.44772 6 4 6V4C2.34315 4 1 5.34315 1 7H3ZM8 4H10V2H8V4ZM10 6H8V8H10V6ZM8 6C7.44772 6 7 5.55228 7 5H5C5 6.65685 6.34315 8 8 8V6ZM11 5C11 5.55228 10.5523 6 10 6V8C11.6569 8 13 6.65685 13 5H11ZM10 4C10.5523 4 11 4.44772 11 5H13C13 3.34315 11.6569 2 10 2V4ZM8 2C6.34315 2 5 3.34315 5 5H7C7 4.44772 7.44772 4 8 4V2Z"
            fill="#0E0333"
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
