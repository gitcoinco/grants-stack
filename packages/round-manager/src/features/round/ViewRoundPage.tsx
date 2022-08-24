import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import { useWallet } from "../common/Auth"
import { useListRoundsQuery } from "../api/services/round"
import Navbar from "../common/Navbar"
import { CalendarIcon, ChevronRightIcon, ClockIcon } from "@heroicons/react/solid"
import { useListProgramsQuery } from "../api/services/program"
import { Tab } from "@headlessui/react"
import ApplicationsReceived from "./ApplicationsReceived"
import ApplicationsApproved from "./ApplicationsApproved"
import ApplicationsRejected from "./ApplicationsRejected"
import Footer from "../common/Footer"
import { useListGrantApplicationsQuery } from "../api/services/grantApplication";
import tw from "tailwind-styled-components";
import { Button } from "../common/styles"
import { datadogLogs } from "@datadog/browser-logs"

enum TabIndex {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2
}

export default function ViewRoundPage() {

  datadogLogs.logger.info('====> Route: /round/create')
  datadogLogs.logger.info(`====> URL: ${window.location.href}`)

  const [bulkSelect, setBulkSelect] = useState(false)

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
    }),
  })

  const { data: applications } = useListGrantApplicationsQuery({
    roundId: id!, signerOrProvider: provider
  })

  const pendingApplications = applications?.filter((a) => a.status === "PENDING") || []
  const approvedApplications = applications?.filter((a) => a.status === "APPROVED") || []
  const rejectedApplications = applications?.filter((a) => a.status === "REJECTED") || []

  const [currentTabIndex, setCurrentTabIndex] = useState(TabIndex.PENDING);

  const doesTabHaveApplications = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case TabIndex.PENDING: {
        return pendingApplications?.length > 0
      }
      case TabIndex.APPROVED: {
        return approvedApplications?.length > 0
      }
      case TabIndex.REJECTED: {
        return rejectedApplications?.length > 0
      }
      default:
        return false
    }
  }

  const formatDate = (date: Date | undefined) => date?.toLocaleDateString()

  const TabApplicationCounter = tw.div`
      rounded-md
      ml-2
      w-8
      h-5
      float-right
      font-sm
      font-normal
  `

  const tabStyles = (selected: boolean) => selected ?
    "border-violet-500 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm outline-none" :
    "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

  return (
    <>
      <Navbar />
      <div className="flex flex-col w-screen mx-0">
        <header className="border-b bg-grey-150 px-3 md:px-20 py-6">
          <div className="text-grey-400 font-bold text-sm flex flex-row items-center gap-3">
            <Link to={`/`}>
              <span>{"My Programs"}</span>
            </Link>
            <ChevronRightIcon className="h-6 w-6" />
            <Link to={`/program/${program?.id}`}>
              <span>{"Program Details"}</span>
            </Link>
            <ChevronRightIcon className="h-6 w-6" />
            <Link to={`/round/${id}`}>
              <span>{"Round Details"}</span>
            </Link>
          </div>
          <h1 className="text-3xl sm:text-[32px] my-2">
            {round?.roundMetadata?.name || "Round Details"}
          </h1>
          <div className="flex flex-row flex-wrap">
            <div className="flex mr-8 lg:mr-36 pb-3">
              <CalendarIcon className="h-5 w-5 mr-2 text-grey-400" />
              <p className="text-sm mr-1 text-grey-400">Applications:</p>
              <p className="text-sm">
                {formatDate(round?.applicationsStartTime) || "..."}
                <span className="mx-1">-</span>
                {formatDate(round?.applicationsEndTime) || "..."}
              </p>
            </div>

            <div className="flex">
              <ClockIcon className="h-5 w-5 mr-2 text-grey-400" />
              <p className="text-sm mr-1 text-grey-400">Round:</p>
              <p className="text-sm">
                {formatDate(round?.roundStartTime) || "..."}
                <span className="mx-1">-</span>
                {formatDate(round?.roundEndTime) || "..."}
              </p>
            </div>
          </div>
        </header>

        <main className="px-3 md:px-20 pt-6">
          {
            isRoundsFetched &&
            <div>
              <p className="text-bold text-md font-semibold mb-2">Grant Applications</p>
              <div>
                <Tab.Group onChange={setCurrentTabIndex}>
                  <Tab.List className="border-b mb-6 flex items-center justify-between">
                    <div className="space-x-8">
                      <Tab className={({ selected }) => tabStyles(selected)}>
                        {({ selected }) =>
                          <div className={selected ? "text-violet-500" : ""}>
                            Received
                            <TabApplicationCounter className={selected ? "bg-violet-100" : "bg-grey-150"}
                              data-testid="received-application-counter">
                              {pendingApplications?.length || 0}
                            </TabApplicationCounter>
                          </div>
                        }
                      </Tab>
                      <Tab className={({ selected }) => tabStyles(selected)}>
                        {({ selected }) =>
                          <div className={selected ? "text-violet-500" : ""}>
                            Approved
                            <TabApplicationCounter className={selected ? "bg-violet-100" : "bg-grey-150"}
                              data-testid="approved-application-counter">
                              {approvedApplications?.length || 0}
                            </TabApplicationCounter>
                          </div>
                        }
                      </Tab>
                      <Tab className={({ selected }) => tabStyles(selected)}>
                        {({ selected }) =>
                          <div className={selected ? "text-violet-500" : ""}>
                            Rejected
                            <TabApplicationCounter className={selected ? "bg-violet-100" : "bg-grey-150"}
                              data-testid="rejected-application-counter">
                              {rejectedApplications?.length || 0}
                            </TabApplicationCounter>
                          </div>
                        }
                      </Tab>
                    </div>
                    {doesTabHaveApplications(currentTabIndex) &&
                      <div className="justify-end">
                        <span className="text-grey-400 text-sm mr-6">
                          Save in gas fees by approving/rejecting multiple applications at once.
                        </span>
                        {bulkSelect ?
                          <Button
                            type="button"
                            $variant="outline"
                            className="text-xs text-pink-500"
                            onClick={() => setBulkSelect(false)}
                          >
                            Cancel
                          </Button>
                          :
                          <Button
                            type="button"
                            $variant="outline"
                            className="text-xs bg-grey-150 border-none"
                            onClick={() => setBulkSelect(true)}
                          >
                            Select
                          </Button>
                        }
                      </div>
                    }
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel>
                      <ApplicationsReceived bulkSelect={bulkSelect} setBulkSelect={setBulkSelect} />
                    </Tab.Panel>
                    <Tab.Panel>
                      <ApplicationsApproved bulkSelect={bulkSelect} setBulkSelect={setBulkSelect}/>
                    </Tab.Panel>
                    <Tab.Panel>
                      <ApplicationsRejected />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
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
