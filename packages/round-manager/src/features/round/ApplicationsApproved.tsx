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


export default function ApplicationsApproved() {
  const { id } = useParams()
  const { provider } = useWallet()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, signerOrProvider: provider, status: "APPROVED"
  })

  return (
    <CardsContainer>
      {isSuccess && data?.map((application, index) => (
        <Link to={`/round/${id}/application/${application.id}`}>
          <BasicCard key={index} className="application-card" data-testid="application-card">
            <CardHeader>
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
            <CardContent>
              <CardTitle>{application.project!.title}</CardTitle>
              <CardDescription>{application.project!.description}</CardDescription>
            </CardContent>
          </BasicCard>
        </Link>
      ))}
      {isLoading &&
        <Spinner text="Fetching Grant Applications" />
      }
    </CardsContainer>
  )
}
