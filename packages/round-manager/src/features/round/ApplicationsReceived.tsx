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
  CardDescription
} from "../common/styles"


export default function ApplicationsReceived() {
  const { id } = useParams()
  const {chain: { network }} = useWallet()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, network, status: "PENDING"
  })

  return (
    <CardsContainer>
      {isSuccess && data?.map((application, index) => (
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
    </CardsContainer>
  )
}
