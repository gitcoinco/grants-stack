import { ReactComponent as ManagerLogoDark } from "../../assets/manager-logo-dark.svg";
import { ReactComponent as GitcoinLogoDark } from "../../assets/gitcoin-logo.svg";
import Navbar from "common/src/components/Navbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ManagerNavbar() {
  return (
    <Navbar
      className="bg-white drop-shadow-md z-10 w-full mx-auto  px-6 max-w-screen text-white  lex justify-between h-16"
      ConnectWalletItem={<ConnectButton />}
      logo={
        <div
          className="flex-shrink-0 flex items-center"
          data-testid={"home-link"}
        >
          <GitcoinLogoDark className="block h-8 w-auto" />
          <div className="hidden lg:block md:block">
            <span className="mx-6 text-black">|</span>
            <ManagerLogoDark className="lg:inline-block md:inline-block" />
          </div>
        </div>
      }
    />
  );
}
