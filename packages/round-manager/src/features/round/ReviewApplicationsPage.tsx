import { useNavigate, useParams } from "react-router-dom"

import { Button } from "../common/styles"
import { useWeb3 } from "../common/ProtectedRoute"


export default function ReviewApplications() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { account } = useWeb3()

  const goBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate(`/round/${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-16 h-screen">
      <header>
        <p className="mb-32">
          <span className="text-5xl">Applications Received</span>
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