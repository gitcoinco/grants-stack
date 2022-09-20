import { Outlet, useOutletContext } from "react-router-dom"
import { useAccount, useNetwork, useProvider, useSigner } from "wagmi"

import { Web3Instance } from "../api/types"
import { Spinner } from "./Spinner";
import Footer from "./Footer";
import { ConnectButton } from "@rainbow-me/rainbowkit";


/**
 * Component for protecting child routes that require web3 wallet instance.
 * It prompts a user to connect wallet if no web3 instance is found.
 */
export default function Auth() {
  const { address, isConnected, isConnecting } = useAccount()
  const { chain } = useNetwork()
  const { data: signer } = useSigner()
  const provider = useProvider()

  const data = {
    address,
    chain: { id: chain?.id, name: chain?.name, network: chain?.network },
    provider,
    signer
  }

  return !isConnected ? (
    <div>
      <main>
        {isConnecting
          ? <Spinner text="Connecting Wallet" />
          :
          <div className="container mx-auto flex flex-row bg-white">
            <div className="basis-1/2 m-auto">
              <h1 className="mb-6">Grant Explorer</h1>
              <ConnectButton />
            </div>
          </div>
        }
      </main>
      <Footer />
    </div>
  ) : <Outlet context={data} />
}


/**
 * Wrapper hook to expose wallet auth information to other components
 */
export function useWallet() {
  return useOutletContext<Web3Instance>()
}