import { Outlet, useOutletContext } from 'react-router-dom'

import { useGetWeb3Query } from "../api/services/web3"
import { Web3Instance } from "../api/types"
import { Spinner } from "../common/Spinner";
import { ReactComponent as LandingBanner } from "../../assets/landing/banner.svg"
import { ReactComponent as LandingLogo } from "../../assets/landing/logo.svg"



/**
 * Component for protecting child routes that require web3 wallet instance.
 * It prompts a user to connect wallet if no web3 instance is found.
 */
export default function ProtectedRoute() {
  const { data, refetch, isSuccess, isLoading } = useGetWeb3Query()

  const connectHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    refetch()
  }

  return !isSuccess ? (
    <div>
      <main>
        {isLoading
          ? <Spinner text="Connecting Wallet" />
          :
          <div className="h-screen">
            <div className="flex left-0 h-full fixed bg-white z-10">
              <div className="m-auto ml-20">
                <LandingLogo className="block w-auto mb-6"></LandingLogo>
                <h1 className='mb-6'>Round Manager</h1>
                <p className="text-2xl my-2 text-grey-400">
                  As a round operator you can manage high-impact<br />
                  grant programs and distribute funds across different<br />
                  rounds and voting mechanisms.
                </p>
                <button type="button" className="bg-violet-400 mt-8 py-4 px-8 rounded text-white" onClick={connectHandler}>
                  Connect Wallet
                </button>
              </div>
            </div>
            <div className="right-0 w-1/2 h-full fixed overflow-x">
              <LandingBanner className="w-auto right-0 absolute align-middle"></LandingBanner>
            </div>
          </div>
        }
      </main>
    </div>
  ) : <Outlet context={data} />
}


/**
 * Wrapper hook to expose wallet auth information to other components
 */
export function useWeb3() {
  return useOutletContext<Web3Instance>()
}