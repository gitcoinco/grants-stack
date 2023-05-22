import { Outlet, useOutletContext } from "react-router-dom";
import { useAccount, useNetwork, useProvider, useSigner } from "wagmi";
import { Web3Instance } from "../api/types";
import { Spinner } from "./Spinner";
import { ReactComponent as LandingBanner } from "../../assets/landing/banner.svg";
import { ReactComponent as LandingLogo } from "../../assets/landing/logo.svg";
import Footer from "common/src/components/Footer";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "./Navbar";

/**
 * Component for protecting child routes that require web3 wallet instance.
 * It prompts a user to connect wallet if no web3 instance is found.
 */
export default function Auth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const data = {
    address,
    chain: { id: chain?.id, name: chain?.name, network: chain?.network },
    provider,
    signer,
  };

  return !isConnected ? (
    <div>
      <Navbar programCta={false} />
      <main className="pt-4">
        {isConnecting ? (
          <Spinner text="Connecting Wallet" />
        ) : (
          <div className="grid grid-rows-3 grid-flow-col bg-white">
            <div className="row-span-2"></div>
            <div className="row-span-5">
              <div className="my-[15rem]">
                <LandingLogo className="block w-auto mb-6 ml-2"></LandingLogo>
                <h1 className="mb-6">Manager</h1>
                <p className="text-2xl mt-2 mb-6 text-grey-400">
                  As a round operator you can manage high-impact
                  <br />
                  grant programs and distribute funds across different
                  <br />
                  rounds and voting mechanisms.
                </p>
                <ConnectButton />
              </div>
            </div>
            <div className="row-span-5">
              <LandingBanner className="align-middle float-right"></LandingBanner>
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
