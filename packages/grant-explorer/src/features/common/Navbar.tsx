// import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
// import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCart } from "../../context/CartContext";
import CustomerSupport from "./CustomerSupport";
import NavBarLogo from "./NavBarLogo";
import NavbarCart from "./NavbarCart";

export interface NavbarProps {
  roundUrlPath: string;
  customBackground?: string;
  isBeforeRoundEndDate?: boolean;
}

export default function Navbar(props: NavbarProps) {
  const [cart] = useCart();
  // const { chainId, roundId } = useParams();

  return (
    <nav className={`bg-white fixed w-full z-10 ${props.customBackground}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between h-16">
          <NavBarLogo url="/" />
          <div className="flex items-center gap-6">
            <div data-testid="connect-wallet-button" id="connect-wallet-button">
              <ConnectButton />
            </div>
            {props.isBeforeRoundEndDate &&
              <NavbarCart cart={cart} roundUrlPath={props.roundUrlPath} />
            }
            <CustomerSupport />
          </div>
        </div>
      </div>
    </nav>
  );
}
