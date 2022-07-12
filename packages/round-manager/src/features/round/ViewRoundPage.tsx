import { Link, useNavigate, useParams } from "react-router-dom"

import { useWeb3 } from "../common/ProtectedRoute"
import { useListRoundsQuery } from "../api/services/round"
import Navbar from "../common/Navbar"
import { ArrowNarrowLeftIcon, CalendarIcon, ClockIcon } from "@heroicons/react/solid"
import { useListProgramsQuery } from "../api/services/program"


export default function ViewRound() {
  const { id } = useParams()

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

  const { program } = useListProgramsQuery(account, {
    selectFromResult: ({ data }) => ({
      program: data?.find((program) => program.id === round?.ownedBy) }
    ),
  })

  const formatDate = (date: Date | undefined) => date?.toLocaleDateString()

  return (
    <>
    <Navbar />
    <div className="container mx-auto h-screen px-4 py-7">
      <header>
        <div className="mb-4">
          <Link className="text-sm flex gap-2" to={`/program/${program?.id}`}>
            <ArrowNarrowLeftIcon className="h-3 w-3 mt-1" />
            <span>{program?.metadata?.name || "..."}</span>
          </Link>
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
            <div className="my-5 flex">
              <div className="flex mr-3 pr-3">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <p className="text-sm mr-1 text-grey-500">Application Start & End:</p>
                <p className="text-sm">
                  {formatDate(round?.applicationsStartTime) || "..."}
                  <span className="mx-1">-</span>
                  {formatDate(round?.applicationsEndTime) || "..."}
                </p>
              </div>

              <div className="flex">
                <ClockIcon className="h-5 w-5 mr-2" />
                <p className="text-sm mr-1 text-grey-500">Grant Round Start & End:</p>
                <p className="text-sm">
                  {formatDate(round?.roundStartTime) || "..."}
                  <span className="mx-1">-</span>
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