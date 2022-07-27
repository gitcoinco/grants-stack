import { ArrowNarrowLeftIcon, CheckIcon, XIcon } from "@heroicons/react/solid"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  useListGrantApplicationsQuery,
  useUpdateGrantApplicationMutation
} from "../api/services/grantApplication"
import { useListRoundsQuery } from "../api/services/round"
import ConfirmationModal from "../common/ConfirmationModal"
import Navbar from "../common/Navbar"
import { useWeb3 } from "../common/ProtectedRoute"
import { Button } from "../common/styles"


type ApplicationStatus = "APPROVED" | "REJECTED" | "APPEAL" | "FRAUD"


export default function ViewApplicationPage() {
  const [reviewDecision, setReviewDecision] = useState<ApplicationStatus | undefined>(undefined)
  const [openModal, setOpenModal] = useState(false)

  const { roundId, id } = useParams()
  const { account } = useWeb3()

  const { application, refetch, isLoading } = useListGrantApplicationsQuery({ roundId: roundId!, id }, {
    selectFromResult: ({ data, isLoading }) => ({
      application: data?.find((application) => application.id === id),
      isLoading
    })
  })

  const { round } = useListRoundsQuery({ account }, {
    selectFromResult: ({ data }) => ({
      round: data?.find((round) => round.id === roundId)
    }),
  })

  const [updateGrantApplication, {
    isLoading: updating,
  }] = useUpdateGrantApplicationMutation()


  const handleUpdateGrantApplication = async () => {
    try {
      setOpenModal(false)

      await updateGrantApplication({
        status: reviewDecision!,
        id: application!.id,
        roundId: roundId!,
        payoutAddress: application!.recipient,
        projectsMetaPtr: application!.projectsMetaPtr
      }).unwrap()

      refetch()

    } catch (e) {
      console.error(e)
    }
  }

  const confirmReviewDecision = (status: ApplicationStatus) => {
    setReviewDecision(status)
    setOpenModal(true)
  }

  const handleCancelModal = () => {
    setReviewDecision(undefined)
    setOpenModal(false)
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto h-screen px-4 py-7">
        <header>
          <div className="pb-5 border-grey-100 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <ArrowNarrowLeftIcon className="h-3 w-3 mt-1 bigger" />
              <Link className="text-sm gap-2" to={`/round/${round?.id}`}>
                <span>
                  {round?.roundMetadata?.name || "..."}
                </span>
              </Link>
            </div>
            <div className="mt-3 flex sm:mt-0 sm:ml-4">
              <Button
                type="button"
                $variant={application?.status === "APPROVED" ? "solid" : "outline"}
                className="inline-flex float-right py-2 px-4 text-sm"
                disabled={isLoading || updating}
                onClick={() => confirmReviewDecision("APPROVED")}
              >
                <CheckIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                {application?.status === "APPROVED" ? "Approved" : "Approve"}
              </Button>
              <Button
                type="button"
                $variant={application?.status === "REJECTED" ? "solid" : "outline"}
                className={"inline-flex ml-3 py-2 px-4 text-sm" + (application?.status === "REJECTED" ? "" : "text-grey-500")}
                disabled={isLoading || updating}
                onClick={() => confirmReviewDecision("REJECTED")}
              >
                <XIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                {application?.status === "REJECTED" ? "Rejected" : "Reject"}
              </Button>
            </div>
          </div>
          <ConfirmationModal
            body={"You have rejected a Grant Application. This will carry gas fees based on the selected network"}
            confirmButtonAction={handleUpdateGrantApplication}
            cancelButtonAction={handleCancelModal}
            isOpen={openModal}
          />
        </header>

        <main>
          <h1 className="float-left text-[32px] mb-6">{application?.project.title || "..."}</h1>
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