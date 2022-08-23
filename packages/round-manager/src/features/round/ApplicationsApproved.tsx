import { Link, useParams } from "react-router-dom"

import { useListGrantApplicationsQuery } from "../api/services/grantApplication"
import { useWallet } from "../common/Auth"
import { Spinner } from "../common/Spinner"
import {
  CardsContainer,
  BasicCard,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription, Button,
} from "../common/styles"
import { CheckIcon, XIcon } from "@heroicons/react/solid"
import { GrantApplication, ProjectStatus } from "../api/types"
import { useEffect, useState } from "react"

interface ApplicationsApprovedProps {
  bulkSelect?: boolean;
  setBulkSelect?: (bulkSelect: boolean) => void;
}


export default function ApplicationsApproved({
 bulkSelect = false,
 setBulkSelect = () => { },
}: ApplicationsApprovedProps) {
  const { id } = useParams()
  const { provider, signer } = useWallet()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, signerOrProvider: provider, status: "APPROVED"
  })

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

  const toggleSelection = (id: string, status: ProjectStatus) => {
    const newState = selected?.map((grantApp : GrantApplication) => {
      if (grantApp.id === id) {
        const newStatus = grantApp.status === status ? "PENDING" : status
        return { ...grantApp, status: newStatus }
      }

      return grantApp
    })

    setSelected(newState)
  }

  const checkSelection = (id: string) => {
    return (selected?.find((grantApp: GrantApplication) => grantApp.id === id))?.status
  }

  return (
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
        <Spinner text="Fetching Grant Applications" />
      }
    </CardsContainer>
  )
}
