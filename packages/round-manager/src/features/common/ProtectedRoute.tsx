import { Outlet, useOutletContext } from 'react-router-dom'

import { useGetWeb3Query } from "../api/services/web3"
import { Web3Instance } from "../api/types"


/**
 * Component for protecting child routes that require web3 wallet instance.
 * It prompts a user to connect wallet if no web3 instance is found.
 */
export default function ProtectedRoute() {
  const { data, error, refetch, isSuccess, isFetching, isLoading } = useGetWeb3Query()

  const connectHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    refetch()
  }

  return !isSuccess ? (
    <div>
      <main className="bg-[#0E0333] h-screen">
        {!isFetching && !isLoading &&
          <>
          <div className="flex left-0 h-full fixed bg-white z-10">
            <div className="m-auto pl-20">
              <h1 className="text-6xl my-2.5">Round Manager</h1>
              <p className="text-base my-4">
                As a round operator you can manage high-impact<br/>
                grant programs and distribute funds across different<br/>
                rounds and voting mechanisms.
              </p>
              <button className="bg-[#0E0333] font-bold mt-10 py-4 px-8 rounded text-white" type="button" onClick={connectHandler}>
                Connect Wallet
              </button>
              <p className="text-red-600 mt-4">{error?.toString()}</p>
            </div>
          </div>
          <div className="left-0 w-[55%] h-full fixed overflow-x-hidden skew-x-[-10deg] bg-white"></div>
          <div className="right-0 w-1/2 h-full fixed overflow-x-hidden"></div>
          </>
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