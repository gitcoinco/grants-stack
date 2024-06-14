import { Outlet } from "react-router-dom";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";

import { Spinner } from "./Spinner";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
    provider,
    signer,
  };

  return !isConnected ? (
    <div>
      <main>
        {isConnecting ? (
          <Spinner text="Connecting Wallet" />
        ) : (
          <div className="container mx-auto flex flex-row bg-white">
            <div className="basis-1/2 m-auto">
              <h1 className="mb-6">Explorer</h1>
              <ConnectButton />
            </div>
          </div>
        )}
      </main>
    </div>
  ) : (
    <Outlet context={data} />
  );
}
