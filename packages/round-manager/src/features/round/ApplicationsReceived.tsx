import { Link, useParams } from "react-router-dom"

import { useListGrantApplicationsQuery } from "../api/services/grantApplication"
import { Spinner } from "../common/Spinner"


export default function ApplicationsReceived() {
  const { id } = useParams()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, status: "PENDING"
  })

  return (
    <div>
      {isSuccess && data?.map((application, index) => (
        <div key={index}>
          <Link to={`/round/${id}/application/${application.id}`}>
            {JSON.stringify(application)}
          </Link>
        </div>
      ))}
      {isLoading &&
        <Spinner text="Fetching Grant Applications" />
      }
    </div>
  )
}
