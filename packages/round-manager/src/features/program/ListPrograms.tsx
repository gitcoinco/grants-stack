import { Link } from "react-router-dom"

import { useWeb3 } from "../common/ProtectedRoute"


function ListPrograms() {

  const { account } = useWeb3()

  return (
    <div className="container mx-auto px-4 py-16 h-screen">
      <header>
        <h1 className="text-5xl mb-16">My Programs</h1>
      </header>
      <main className="h-screen">
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
      </main>
      <footer className="text-center mb-auto">
        <p>with <span className="text-red-600">&hearts;</span> from Gitcoin | Connected: { account }</p>
      </footer>
    </div>
  );
}

export default ListPrograms;