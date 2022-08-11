import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { InboxInIcon as NoApplicationsForRoundIcon } from "@heroicons/react/outline"
import { useListGrantApplicationsQuery } from "../api/services/grantApplication"
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
import { ProjectStatus } from "../api/types"


interface ApplicationsReceivedProps {
  bulkSelect?: boolean;
}

interface SelectedApplication {
  id: string;
  status: ProjectStatus | undefined;
}


export default function ApplicationsReceived({
  bulkSelect = false
}: ApplicationsReceivedProps) {
  const { id } = useParams()
  const { provider } = useWallet()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, signerOrProvider: provider, status: "PENDING"
  })

  const [selected, setSelected] = useState<SelectedApplication[] | undefined>([])

  useEffect(() => {
    if (isSuccess || !bulkSelect) {
      setSelected(data?.map(application => {
        return {
          id: application.id,
          status: application.status
        }
      }))
    }
  }, [data, isSuccess, bulkSelect])

  const markAsSelected = (id: string, status: string) => {
    const newState = selected?.map((obj: any) => {
      if (obj.id === id) {
        return { ...obj, status }
      }

      return obj
    })

    setSelected(newState)
  }

  const checkSelection = (id: string) => {
    return (selected?.find((obj: any) => obj.id === id))?.status
  }


  return (
    <CardsContainer>
      {isSuccess && data?.filter(it => it.status === "PENDING").map((application, index) => (
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
                  onClick={() => markAsSelected(application.id, "APPROVED")}
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
                  onClick={() => markAsSelected(application.id, "REJECTED")}
                  data-testid="reject-button"
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </div>)}
            <div>
              <div>
                <img
                  className="h-[120px] w-full object-cover rounded-t"
                  src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${application.project.bannerImg}`}
                  alt=""
                />
              </div>
              <div className="pl-4">
                <div className="-mt-6 sm:-mt-6 sm:flex sm:items-end sm:space-x-5">
                  <div className="flex">
                    <img
                      className="h-12 w-12 rounded-full ring-4 ring-white bg-white"
                      src={`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${application.project.logoImg}`}
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link to={`/round/${id}/application/${application.id}`}>
              <CardTitle>{application.project.title}</CardTitle>
            </Link>
            <CardDescription>{application.project.description}</CardDescription>
          </CardContent>
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
          <div className="text-sm">Try promoting your Grant Progam to get more traction!</div>
        </div>

      }
    </CardsContainer>
  )
}
