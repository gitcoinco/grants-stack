import { Outlet, useOutletContext } from 'react-router-dom'
import { useAccount, useEnsName } from 'wagmi'

import { Web3Instance } from "../api/types"
import { Spinner } from "../common/Spinner";
import { ReactComponent as LandingBanner } from "../../assets/landing/banner.svg"
import { ReactComponent as LandingLogo } from "../../assets/landing/logo.svg"
import Footer from './Footer';

import { useState } from 'react';
import WalletConnectionModal from './WalletConnectionModal';


/**
 * Component for protecting child routes that require web3 wallet instance.
 * It prompts a user to connect wallet if no web3 instance is found.
 */
export default function ProtectedRoute() {
  const [openModal, setOpenModal] = useState(false)

  const { address: account, isConnected, isConnecting } = useAccount()
  const { data: ensName } = useEnsName({ address: account })

  const data = { account, ensName }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  return !isConnected ? (
    <div>
      <main>
        {isConnecting
          ? <Spinner text="Connecting Wallet" />
          :
          <div className="flex flex-row bg-white">
            <div className="basis-1/2 m-auto ml-20">
              <LandingLogo className="block w-auto mb-6"></LandingLogo>
              <h1 className='mb-6'>Round Manager</h1>
              <p className="text-2xl my-2 text-grey-400">
                As a round operator you can manage high-impact<br />
                grant programs and distribute funds across different<br />
                rounds and voting mechanisms.
              </p>
              <button type="button" className="bg-violet-400 mt-8 py-4 px-8 rounded text-white" onClick={() => setOpenModal(true)}>
                Connect Wallet
              </button>
            </div>
            <div className="basis-1/2 right-0">
              <LandingBanner className="right-0 align-middle"></LandingBanner>
            </div>
          </div>
        }
        <WalletConnectionModal isOpen={openModal} cancelButtonAction={handleCloseModal} />
      </main>
      <Footer />
    </div>
  ) : <Outlet context={data} />
}


/**
 * Wrapper hook to expose wallet auth information to other components
 */
export function useWeb3() {
  return useOutletContext<Web3Instance>()
}