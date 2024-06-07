import { Outlet, useOutletContext } from "react-router-dom";
import { useAccount } from "wagmi";
import { Web3Instance } from "../api/types";
import { Spinner } from "./Spinner";
// import { ReactComponent as LandingBanner } from "../../assets/landing/banner.svg";
// import { ReactComponent as LandingLogo } from "../../assets/landing/logo.svg";
import Footer from "common/src/components/Footer";
import Navbar from "./Navbar";
import { providers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Component for protecting child routes that require web3 wallet instance.
 * It prompts a user to connect wallet if no web3 instance is found.
 */
export default function Auth() {
  const { chain, address, isConnected, isConnecting } = useAccount();
  const provider = new providers.Web3Provider(window.ethereum, chain?.id);
  const signer = provider.getSigner(address);

  const data = {
    address,
    chain: { id: chain?.id, name: chain?.name, network: chain },
    signer,
    provider,
  };

  // todo: add background image
  return !isConnected ? (
    <div>
      <Navbar programCta={false} />
      <main className="pt-4">
        {isConnecting ? (
          <Spinner text="Logging you in..." />
        ) : (
          <div className="flex flex-col bg-white">
            <div className="my-[15rem] sm:ml-4 md:ml-8 lg:ml-20">
              <span className="mb-6 text-6xl">Fund the future.</span>
              <p className="text-2xl mt-2 mb-6 text-grey-400">
                Customize your own grant rounds to support
                <br />
                innovative projects and streamline fund allocation.
              </p>
              <ConnectButton label="Log In" />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  ) : (
    <Outlet context={data} />
  );
}

/**
 * Wrapper hook to expose wallet auth information to other components
 */
export function useWallet() {
  return useOutletContext<Web3Instance>();
}
