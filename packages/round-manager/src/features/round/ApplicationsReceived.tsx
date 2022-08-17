import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { InboxInIcon as NoApplicationsForRoundIcon } from "@heroicons/react/outline"
import { useBulkUpdateGrantApplicationsMutation, useListGrantApplicationsQuery } from "../api/services/grantApplication"
import { useWallet } from "../common/Auth"
import { Spinner } from "../common/Spinner"
import {
  CardsContainer,
  BasicCard,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button
} from "../common/styles"
import { CheckIcon, XIcon } from "@heroicons/react/solid"
import { GrantApplication } from "../api/types"
import ConfirmationModal from "../common/ConfirmationModal"


interface ApplicationsReceivedProps {
  bulkSelect?: boolean;
  setBulkSelect?: (bulkSelect: boolean) => void;
}


export default function ApplicationsReceived({
  bulkSelect = false,
  setBulkSelect = () => { },
}: ApplicationsReceivedProps) {
  const [openModal, setOpenModal] = useState(false)

  const { id } = useParams()
  const { provider, signer } = useWallet()

  const { data, refetch, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, signerOrProvider: provider, status: "PENDING"
  })

  const [bulkUpdateGrantApplications, {
    isLoading: isBulkUpdateLoading,
  }] = useBulkUpdateGrantApplicationsMutation()

  const [selected, setSelected] = useState<GrantApplication[]>([])

  useEffect(() => {
    if (isSuccess || !bulkSelect) {
      setSelected((data || []).map(application => {
        return {
          id: application.id,
          round: application.round,
          recipient: application.recipient,
          projectsMetaPtr: application.projectsMetaPtr,
          status: application.status
        }
      }))
    }
  }, [data, isSuccess, bulkSelect, signer])

  const toggleSelection = (id: string, status: string) => {
    const newState = selected?.map((obj: any) => {
      const newStatus = obj.status === status ? "PENDING" : status

      if (obj.id === id) {
        return { ...obj, status: newStatus }
      }

      return obj
    })

    setSelected(newState)
  }

  const checkSelection = (id: string) => {
    return (selected?.find((obj: any) => obj.id === id))?.status
  }

  const handleBulkReview = async () => {
    try {
      await bulkUpdateGrantApplications({
        roundId: id!,
        applications: selected.filter(application => application.status !== "PENDING"),
        signer,
        provider
      }).unwrap()
      setBulkSelect(false)
      setOpenModal(false)
      refetch()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <CardsContainer>
        {isSuccess && data?.map((application, index) => (
          <BasicCard key={index} className="application-card" data-testid="application-card">
            <CardHeader>
              {bulkSelect && (
                <div className="absolute flex gap-2 translate-x-[206px] translate-y-4 mr-4" data-testid="bulk-approve-reject-buttons">
                  <Button
                    type="button"
                    $variant="solid"
                    className={
                      `border border-grey-400 w-9 h-8 p-2.5 ${checkSelection(application.id) === "APPROVED"
                        ? "bg-teal-400 text-grey-500" : "bg-grey-500 text-white"}`
                    }
                    onClick={() => toggleSelection(application.id, "APPROVED")}
                    data-testid="approve-button"
                  >
                    <CheckIcon aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    $variant="solid"
                    className={
                      `border border-grey-400 w-9 h-8 p-2.5 ${checkSelection(application.id) === "REJECTED"
                        ? "bg-white text-pink-500" : "bg-grey-500 text-white"}`
                    }
                    onClick={() => toggleSelection(application.id, "REJECTED")}
                    data-testid="reject-button"
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                </div>)}
              <div>
                <div>
                  <img
                    className="h-[120px] w-full object-cover rounded-t"
                    src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${application.project!.bannerImg}`}
                    alt=""
                  />
                </div>
                <div className="pl-4">
                  <div className="-mt-6 sm:-mt-6 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex">
                      <img
                        className="h-12 w-12 rounded-full ring-4 ring-white bg-white"
                        src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${application.project!.logoImg}`}
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <Link to={`/round/${id}/application/${application.id}`}>
              <CardContent>
                <CardTitle>{application.project!.title}</CardTitle>
                <CardDescription>{application.project!.description}</CardDescription>
              </CardContent>
            </Link>
          </BasicCard>
        ))}
        {isLoading &&
          <Spinner text="Fetching Grant Applications" />
        }
        {!isLoading && data?.length === 0 &&
          <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
            <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
              <NoApplicationsForRoundIcon className="w-6 h-6" />
            </div>
            <h2 className="mt-8 text-2xl antialiased">No Applications</h2>
            <div className="mt-2 text-sm">Applications have not been submitted yet.</div>
            <div className="text-sm">Try promoting your Grant Program to get more traction!</div>
          </div>

        }
      </CardsContainer>
      {selected && selected?.filter(obj => obj.status !== "PENDING").length > 0 && (
        <>
          <div className="fixed w-full left-0 bottom-0 bg-white">
            <hr />
            <div className="flex justify-end items-center py-5 pr-20">
              <span className="text-grey-400 text-sm mr-6">
                You have selected {selected?.filter(obj => obj.status !== "PENDING").length} Grant Applications
              </span>
              <Button
                type="button"
                $variant="solid"
                className="text-sm px-5"
                onClick={() => setOpenModal(true)}
              >
                Continue
              </Button>
            </div>
          </div>
          <ConfirmationModal
            title={"Confirm Decision"}
            body={"You have selected multiple Grant Applications to approve and/or reject."}
            confirmButtonText={isBulkUpdateLoading ? "Confirming..." : "Confirm"}
            bodyStyled={
              <>
                <div className="flex my-8 gap-16 justify-center items-center text-center">
                  <div className="grid gap-2" data-testid="approved-applications-count">
                    <i className="flex justify-center">
                      <CheckIcon className="bg-teal-400 text-grey-500 rounded-full h-6 w-6 p-1" aria-hidden="true" />
                    </i>
                    <span className="text-xs text-grey-400 font-semibold text-center mt-2">APPROVED</span>
                    <span className="text-grey-500 font-semibold">{selected?.filter(obj => obj.status === "APPROVED").length}</span>
                  </div>
                  <span className="text-4xl font-thin">|</span>
                  <div className="grid gap-2" data-testid="rejected-applications-count">
                    <i className="flex justify-center">
                      <XIcon className="bg-pink-500 text-white rounded-full h-6 w-6 p-1" aria-hidden="true" />
                    </i>
                    <span className="text-xs text-grey-400 font-semibold text-center mt-2">REJECTED</span>
                    <span className="text-grey-500 font-semibold">{selected?.filter(obj => obj.status === "REJECTED").length}</span>
                  </div>
                </div>
                <p className="text-sm italic text-grey-400 mb-2">Changes could be subject to additional gas fees.</p>
              </>
            }
            confirmButtonAction={handleBulkReview}
            cancelButtonAction={() => setOpenModal(false)}
            isOpen={openModal}
            setIsOpen={setOpenModal}
          />
        </>
      )}
    </div>
  )
}
