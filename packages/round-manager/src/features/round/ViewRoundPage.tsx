import { Link, useParams } from "react-router-dom"

import { useWallet } from "../common/Auth"
import { useListRoundsQuery } from "../api/services/round"
import Navbar from "../common/Navbar"
import { ArrowNarrowLeftIcon, CalendarIcon, ClockIcon } from "@heroicons/react/solid"
import { useListProgramsQuery } from "../api/services/program"
import { Tab } from "@headlessui/react"
import ApplicationsReceived from "./ApplicationsReceived"
import ApplicationsApproved from "./ApplicationsApproved"
import ApplicationsRejected from "./ApplicationsRejected"
import Footer from "../common/Footer"



export default function ViewRound() {
  const { id } = useParams()
  const { address, provider } = useWallet()

  const {
    round,
    isLoading: isRoundsLoading,
    isSuccess: isRoundsFetched
  } = useListRoundsQuery({ address, signerOrProvider: provider }, {
    selectFromResult: ({ data, isLoading, isSuccess }) => ({
      round: data?.find((round) => round.id === id),
      isLoading,
      isSuccess
    }),
  })

  const { program } = useListProgramsQuery({ address, signerOrProvider: provider }, {
    selectFromResult: ({ data }) => ({
      program: data?.find((program) => program.id === round?.ownedBy)
    }
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
              <ArrowNarrowLeftIcon className="h-3 w-3 mt-1 bigger" />
              <span>{program?.metadata?.name || "..."}</span>
            </Link>
          </div>
          <div className="flow-root">
            <h1 className="float-left text-[32px] mb-6">{round?.roundMetadata?.name || "..."}</h1>
          </div>
          <hr />
        </header>

        <main>
          {
            isRoundsFetched &&
            <div className="my-2">
              <div className="mt-6 mb-8 flex">
                <div className="flex mr-3 pr-3">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <p className="text-sm mr-1 text-grey-400">Application Start & End:</p>
                  <p className="text-sm">
                    {formatDate(round?.applicationsStartTime) || "..."}
                    <span className="mx-1">-</span>
                    {formatDate(round?.applicationsEndTime) || "..."}
                  </p>
                </div>

                <div className="flex">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <p className="text-sm mr-1 text-grey-400">Grant Round Start & End:</p>
                  <p className="text-sm">
                    {formatDate(round?.roundStartTime) || "..."}
                    <span className="mx-1">-</span>
                    {formatDate(round?.roundEndTime) || "..."}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-bold text-md font-semibold mb-2">Grant Applications</p>

                <div>
                  <Tab.Group>
                    <Tab.List className="border-b flex space-x-8 mb-6">
                      <Tab
                        className={({ selected }) =>
                          selected ?
                            "border-grey-500 text-grey-500 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm outline-none" :
                            "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                        }
                      >
                        Received
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          selected ?
                            "border-grey-500 text-grey-500 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm outline-none" :
                            "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                        }
                      >
                        Approved
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          selected ?
                            "border-grey-500 text-grey-500 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm outline-none" :
                            "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                        }
                      >
                        Rejected
                      </Tab>
                    </Tab.List>
                    <Tab.Panels>
                      <Tab.Panel>
                        <ApplicationsReceived />
                      </Tab.Panel>
                      <Tab.Panel>
                        <ApplicationsApproved />
                      </Tab.Panel>
                      <Tab.Panel>
                        <ApplicationsRejected />
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>
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
      <Footer />
    </>
  )
}
