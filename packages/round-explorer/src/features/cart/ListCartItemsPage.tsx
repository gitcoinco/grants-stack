import { useNavigate, useParams } from "react-router-dom"

import { Button } from "../common/styles"
import { useWallet } from "../common/ProtectedRoute"


export default function ListCartItems() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { address } = useWallet()

  const goBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate("/")
  }

  return (
    <div className="container mx-auto px-4 py-16 h-screen">
      <header>
        <p className="mb-32">
          <span className="text-5xl">Cart Items</span>
          <span className="float-right truncate">📒: {account}</span>
        </p>
      </header>
      <main>
        <div>
          <Button type="button" onClick={goBack}>Back</Button>
        </div>
      </main>
    </div >
  )
}