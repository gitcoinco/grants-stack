import { Link } from "react-router-dom";

import { useGetWeb3Query } from "../common/web3Service"


function ListPrograms() {
  const { data, refetch, error, isSuccess } = useGetWeb3Query()

  const connectHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    refetch()
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <header>
        <h1 className="text-5xl">My Programs</h1>
      </header>
      <main className="grid place-items-center h-screen">
        <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-4">
          <Link to="/program/12">
            <button className="w-60 h-60 border-4 border-black bg-gray-300 hover:bg-gray-200 text-2xl">
              Uniswap Defi Burst
            </button>
          </Link>
          <Link to="/program/create">
            <button className="w-60 h-60 rounded-full border-4 border-black hover:bg-gray-200 text-2xl">
              Create Program
            </button>
          </Link>
        </div>

        <div>
          {error !== undefined && (
            <div>
              <div>{error.toString()}</div>
            </div>
          )}

          {!error && isSuccess && (
            <div>
              Welcome {data.account} (chainID: {data.chainId})
            </div>
          )}

          {!isSuccess && (
            <div>
              <button type="button" onClick={connectHandler}>
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ListPrograms;