import { Outlet } from "react-router-dom";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Spinner } from "./Spinner";
import Footer from "common/src/components/Footer";
import Navbar from "./Navbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as LandingBanner } from "../../assets/landing/banner.svg";

/**
 * Component for protecting child routes that require web3 wallet instance.
 * It prompts a user to connect wallet if no web3 instance is found.
 */
export default function Auth() {
  const { chain, address, isConnected, isConnecting } = useAccount();
  const { data: signer } = useWalletClient();
  const provider = usePublicClient();

  const data = {
    address,
    chain: { id: chain?.id, name: chain?.name, network: chain },
    signer,
    provider,
  };

  // todo: add background image
  return !isConnected ? (
    <div className="flex flex-col min-h-screen">
      <LandingBanner className="absolute inset-0 w-full h-full object-cover z-[-1]" />
      <Navbar programCta={false} />
      <main className="flex-grow pt-4 container mx-auto">
        {isConnecting ? (
          <Spinner text="Logging you in..." />
        ) : (
          <div className="flex flex-col bg-transparent">
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
      <div className="w-full bg-transparent">
        <div className="container mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  ) : (
    <Outlet context={data} />
  );
}
