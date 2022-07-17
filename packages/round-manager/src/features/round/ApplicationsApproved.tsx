import { useParams } from "react-router-dom"

import { useListGrantApplicationsQuery } from "../api/services/grantApplication"
import { Spinner } from "../common/Spinner"

export default function ApplicationsApproved() {

  const { id } = useParams()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, status: "APPROVED"
  })

  return (
    <div>
      {isSuccess && data?.map((application, index) => (
        <div key={index}>
          {JSON.stringify(application)}
        </div>
      ))}
      {isLoading &&
        <Spinner text="Fetching Grant Applications" />
      }
    </div>
  )
}