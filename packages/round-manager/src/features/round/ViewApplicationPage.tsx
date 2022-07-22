import { ArrowNarrowLeftIcon } from "@heroicons/react/solid"
import { Link, useParams } from "react-router-dom"
import { useListGrantApplicationsQuery } from "../api/services/grantApplication"
import { useListRoundsQuery } from "../api/services/round"
import Navbar from "../common/Navbar"
import { useWeb3 } from "../common/ProtectedRoute"


export default function ViewApplicationPage() {
  const { roundId, id } = useParams()
  const { account } = useWeb3()

  const { application } = useListGrantApplicationsQuery({ roundId: roundId! }, {
    selectFromResult: ({ data }) => ({
      application: data?.find((application) => application.id === id)
    })
  })

  const { round } = useListRoundsQuery({ account }, {
    selectFromResult: ({ data }) => ({
      round: data?.find((round) => round.id === roundId)
    }),
  })

  return (
    <>
      <Navbar />
      <div className="container mx-auto h-screen px-4 py-7">
        <header>
          <div className="mb-4">
            <Link className="text-sm flex gap-2" to={`/round/${round?.id}`}>
              <ArrowNarrowLeftIcon className="h-3 w-3 mt-1 bigger" />
              <span>{round?.roundMetadata?.name || "..."}</span>
            </Link>
          </div>
          <div className="flow-root">
            <h1 className="float-left text-[32px] mb-6">{JSON.stringify(application) || "..."}</h1>
          </div>
          <hr />
        </header>

        <main>
          {/* <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-4 mb-8">
            {
              isRoundsLoading &&
              <p>Fetching round information...</p>
            }
          </div> */}

        </main>
      </div>
    </>
  )
}