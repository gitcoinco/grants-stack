import { useNavigate, useParams } from "react-router-dom"

import { Button } from "../common/styles"
import { useWeb3 } from "../common/ProtectedRoute"
import { useListRoundsQuery } from "../api/services/round"
import Navbar from "../common/Navbar"


export default function ViewRound() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { account } = useWeb3()
  const {
    round,
    isLoading: isRoundsLoading,
    isSuccess: isRoundsFetched
  } = useListRoundsQuery({ account }, {
    selectFromResult: ({ data, isLoading, isSuccess }) => ({
      round: data?.find((round) => round.id === id),
      isLoading,
      isSuccess
    }),
  })

  const goBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate(-1)
  }

  const goToApplications = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate(`/round/${id}/applications`)
  }

  const formatDate = (date: Date | undefined) => date?.toLocaleDateString(
    "en-US",
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-16 h-screen">
      <header>
        <p className="mb-16">
          <span className="text-5xl">{round?.metadata?.name || "..."}</span>
          <span className="float-right truncate">📒: {account}</span>
        </p>
      </header>
      <main>
        <div>
          {/* <div>
            <h2 className="text-3xl mb-8">Operator Wallets</h2>
            {round?.operatorWallets.map((operatorWallet, index) =>
              <p key={index} className="truncate">{operatorWallet}</p>
            ) || <p>Fetching operator wallets...</p>}
          </div><br /> */}
          {isRoundsLoading && <p className="mb-8">Fetching round information...</p>}
          <p className="my-4">
            <span className="text-2xl">Application Start Date: </span>
            <span>{formatDate(round?.applicationStartTime) || "..."}</span>
          </p>
          <p className="my-4">
            <span className="text-2xl">Round Start Date: </span>
            <span>{formatDate(round?.startTime) || "..."}</span>
          </p>
          <p className="my-4">
            <span className="text-2xl">Round End Date: </span>
            <span>{formatDate(round?.endTime) || "..."}</span>
          </p>
          <p className="my-4">
            <span className="text-2xl">Supported Token for Voting: </span>
            {round?.token ? <a
              href={`https://goerli.etherscan.io/address/${round?.token}`}
              rel="noopener noreferrer"
              target="_blank"
              className="text-blue-600 underline">
              {round?.token}
            </a> : "..."}
          </p>
          <p className="my-4">
            <span className="text-2xl">Voting Contract Address: </span>
            {round?.token ? <a
              href={`https://goerli.etherscan.io/address/${round?.votingStrategy}`}
              rel="noopener noreferrer"
              target="_blank"
              className="text-blue-600 underline">
              {round?.votingStrategy}
            </a> : "..."}
          </p>
          {isRoundsFetched &&
            <Button type="button" onClick={goToApplications}>Review Applications</Button>
          }<br />
          <Button type="button" onClick={goBack}>Back</Button>
        </div>
      </main>
    </div>
    </>
  )
}