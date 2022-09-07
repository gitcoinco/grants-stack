import {Link, useParams} from "react-router-dom"

import {useBulkUpdateGrantApplicationsMutation, useListGrantApplicationsQuery} from "../api/services/grantApplication"
import { useWallet } from "../common/Auth"
import { Spinner } from "../common/Spinner"
import {
  CardsContainer,
  BasicCard,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
} from "../common/styles"
import { XIcon } from "@heroicons/react/solid"
import { GrantApplication, ProjectStatus } from "../api/types"
import { useEffect, useState } from "react"
import ConfirmationModal from "../common/ConfirmationModal";

interface ApplicationsApprovedProps {
  bulkSelect?: boolean;
  setBulkSelect?: (bulkSelect: boolean) => void;
}

export default function ApplicationsApproved({
 bulkSelect = false,
}: ApplicationsApprovedProps) {
  const { id } = useParams()
  const { provider, signer } = useWallet()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, signerOrProvider: provider, status: "APPROVED"
  })

  const [bulkSelectApproved, setBulkSelectApproved] = useState(bulkSelect)
  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<GrantApplication[]>([])

  const [bulkUpdateGrantApplications] = useBulkUpdateGrantApplicationsMutation()

  useEffect(() => {
    if (isSuccess || !bulkSelectApproved) {
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
  }, [data, isSuccess, bulkSelectApproved])

  const toggleRejection = (id: string) => {
    const newState = selected?.map((grantApp : GrantApplication) => {
      if (grantApp.id === id) {
        const newStatus: ProjectStatus = grantApp.status === "REJECTED" ? "APPROVED" : "REJECTED"
        return { ...grantApp, status: newStatus }
      }

      return grantApp
    })

    setSelected(newState)
  }

  const checkSelection = (id: string) => {
    return (selected?.find((grantApp: GrantApplication) => grantApp.id === id))?.status
  }

  const handleBulkReview = async () => {
    try {
      await bulkUpdateGrantApplications({
        roundId: id!,
        applications: selected.filter(application => application.status === "REJECTED"),
        signer,
        provider
      }).unwrap()
      setBulkSelectApproved(false)
      setOpenModal(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      {data && data.length > 0 && <div className="flex items-center justify-end mb-4">
        <span className="text-grey-400 text-sm mr-6">
          Save in gas fees by approving/rejecting multiple applications at once.
        </span>
        {bulkSelectApproved ?
          <Button
            type="button"
            $variant="outline"
            className="text-xs text-pink-500"
            onClick={() => setBulkSelectApproved(false)}
          >
            Cancel
          </Button>
          :
          <Button
            type="button"
            $variant="outline"
            className="text-xs bg-grey-150 border-none"
            onClick={() => setBulkSelectApproved(true)}
          >
            Select
          </Button>
        }
      </div>}
      <CardsContainer>
        {isSuccess && data?.map((application, index) => (
          <BasicCard key={index} className="application-card" data-testid="application-card">
          <CardHeader>
            {bulkSelectApproved && (
              <div className="absolute flex gap-2 translate-x-[250px] translate-y-4 mr-4" data-testid="bulk-approve-reject-buttons">
                <Button
                  type="button"
                  $variant="solid"
                  className={
                    `border border-grey-400 w-9 h-8 p-2.5 ${checkSelection(application.id) === "REJECTED"
                      ? "bg-white text-pink-500" : "bg-grey-500 text-white"}`
                  }
                  onClick={() => toggleRejection(application.id)}
                  data-testid="reject-button"
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </div>)}
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
          <Spinner text="Fetching Grant Applications"/>
        }
      </CardsContainer>
      {selected && selected?.filter(obj => obj.status === "REJECTED").length > 0  &&
        <Continue grantApplications={selected} predicate={obj => obj.status === "REJECTED"}
                  onClick={() => setOpenModal(true)}/>
      }
      <ConfirmationModal
        title={"Confirm Decision"}
        confirmButtonText={"Confirm"}
        confirmButtonAction={handleBulkReview}
        body={
          <>
            <p className="text-sm text-grey-400">
              {"You have selected multiple Grant Applications to be rejected."}
            </p>
            <div className="flex my-8 gap-16 justify-center items-center text-center">
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
        isOpen={openModal}
        setIsOpen={setOpenModal}
      />
    </>
  )
}

function Continue(props: { grantApplications: GrantApplication[], predicate: (obj: any) => boolean, onClick: () => void }) {
  return <div className="fixed w-full left-0 bottom-0 bg-white">
    <hr/>
    <div className="flex justify-end items-center py-5 pr-20">
      <span className="text-grey-400 text-sm mr-6">
        You have selected {props.grantApplications?.filter(props.predicate).length} Grant Applications
      </span>
      <Button
        type="button"
        $variant="solid"
        className="text-sm px-5"
        onClick={props.onClick}
      >
        Continue
      </Button>
    </div>
  </div>;
}
