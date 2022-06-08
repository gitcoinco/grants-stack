import { useNavigate, useParams, Link } from "react-router-dom"

import { Button } from "../common/styles"
import { useWeb3 } from "../common/ProtectedRoute"
import { useListProgramsQuery } from "../api/services/program"


export default function ViewProgram() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { account } = useWeb3()
  const { program } = useListProgramsQuery(account, {
    selectFromResult: ({ data }) => ({ program: data?.find((program) => program.id === id) }),
    pollingInterval: 3000
  })

  const operatorWalletItems = program!.operatorWallets.map((operatorWallet, index) =>
    <p className="ml-16" key={index}>{operatorWallet}</p>
  )

  const goBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate("/")
  }

  return (
    <div className="container mx-auto px-4 py-16 h-screen">
      <header>
        <h1 className="text-5xl mb-16">{program!.metadata!.name}</h1>
      </header>
      <main className="h-screen">
        <div>
          <div>
            <h2 className="text-3xl mb-8">Operator Wallets</h2>
            {operatorWalletItems}
          </div><br />
          <h2 className="text-3xl my-8">My Rounds</h2>
          <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-4 mb-8">
            <Link to="/round/12">
              <button className="w-60 h-60 border-4 border-black bg-gray-300 hover:bg-gray-200 text-2xl">
                Round Name
              </button>
            </Link>
            <Link to="/round/create">
              <button className="w-60 h-60 rounded-full border-4 border-black hover:bg-gray-200 text-2xl">
                Create Round
              </button>
            </Link>
          </div>
          <Button type="button" onClick={goBack}>Back</Button>
        </div>
      </main >
      <footer className="text-center mb-auto">
        <p>with <span className="text-red-600">&hearts;</span> from Gitcoin | Connected: {account}</p>
      </footer>
    </div >
  )
}