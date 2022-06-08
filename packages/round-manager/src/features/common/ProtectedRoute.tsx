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
    <div className="flex h-screen">
      <main className="m-auto">
        {isFetching || isLoading
          ? <p>Loading...</p>
          : <div>
            <button className="font-mono border-black border-4 hover:bg-gray-200 font-bold py-4 px-8 rounded" type="button" onClick={connectHandler}>
              Connect Wallet
            </button>
            <p className="text-red-600 mt-4">{error?.toString()}</p>
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