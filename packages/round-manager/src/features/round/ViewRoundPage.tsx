import { useNavigate, useParams } from "react-router-dom"

import { useWeb3 } from "../common/ProtectedRoute"
import { useListRoundsQuery } from "../api/services/round"
import Navbar from "../common/Navbar"
import { ArrowNarrowLeftIcon, CalendarIcon, ClockIcon } from "@heroicons/react/solid"


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

  const goBack = () => {
    navigate(-1)
  }

  const formatDate = (date: Date | undefined) => date?.toLocaleDateString(
    "en-US",
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <>
    <Navbar />
    <div className="container mx-auto h-screen px-4 py-7">
      <header>
        <div className="mb-4">
          <div className="text-sm flex gap-2" onClick={goBack}>
            <ArrowNarrowLeftIcon className="h-3 w-3 mt-1" />
            <span>Back</span>
          </div>
        </div>
        <div className="flow-root">
          <h1 className="float-left text-[32px] mb-7">{round?.metadata?.name || "..."}</h1>
        </div>
        <hr/>
      </header>

      <main>
        {
          isRoundsFetched &&
          <div className="my-2">
            <div className="my-5 grid grid-cols-2">
              <div className="flex">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <p className="text-sm mr-1 text-grey-500">Application Start & End:</p>
                <p className="text-sm">
                  {formatDate(round?.applicationsStartTime) || "..."}
                  -
                  {formatDate(round?.applicationsEndTime) || "..."}
                </p>
              </div>

              <div className="flex">
                <ClockIcon className="h-5 w-5 mr-2" />
                <p className="text-sm mr-1 text-grey-500">Grant Round Start & End:</p>
                <p className="text-sm">
                  {formatDate(round?.roundStartTime) || "..."}
                  -
                  {formatDate(round?.roundEndTime) || "..."}
                </p>
              </div>
            </div>

            <div>
              <p className="text-bold text-md font-semibold">Grant Applications</p>
            </div>

          </div>
        }

        <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-4 mb-8">
          {
            isRoundsLoading &&
            <p>Fetching round information...</p>
          }
        </div>

      </main>
    </div>
    </>
  )
}