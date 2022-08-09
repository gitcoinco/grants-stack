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
  CardDescription
} from "../common/styles"


export default function ApplicationsReceived() {
  const { id } = useParams()
  const { provider } = useWallet()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, signerOrProvider: provider, status: "PENDING"
  })

  return (
    <CardsContainer>
      {isSuccess && data?.filter(it => it.status === "PENDING").map((application, index) => (
        <BasicCard key={index} className="application-card" data-testid="application-card">
          <CardHeader />
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
