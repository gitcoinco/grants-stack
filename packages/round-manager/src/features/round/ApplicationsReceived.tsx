import { Link, useParams } from "react-router-dom"
import tw from "tailwind-styled-components"

import { useListGrantApplicationsQuery } from "../api/services/grantApplication"
import { Spinner } from "../common/Spinner"


export default function ApplicationsReceived() {
  const { id } = useParams()

  const { data, isLoading, isSuccess } = useListGrantApplicationsQuery({
    roundId: id!, status: "PENDING"
  })

  const ProjectCardsContainer = tw.div`
  flex
  flex-row
  w-full
  bg-indigo-100
  `

  const ProjectCard = tw.div`
  w-1/3
  h-60
  border-2
  border-black
  m-8
  overflow-hidden
  `

  const ProjectCardHeader = tw.div`
  bg-black
  w-full
  h-10
  `

  const ProjectCardTitle = tw.p`
  w-1/3
  text-md
  font-semibold
  text-ellipsis
  `

  return (
    <div>
      {isSuccess && data?.map((application, index) => (
        <div key={index}>
          <Link to={`/round/${id}/application/${application.id}`}>
            <ProjectCardsContainer>
              { isSuccess &&
                data?.map((application, index) => {
                  console.table(application)
                  return (
                    <ProjectCard key={ index } className="application-card">
                      <ProjectCardHeader/>
                      <ProjectCardTitle data-testid="application-card-title">{ JSON.stringify(application) }</ProjectCardTitle>
                      <p data-testid="application-card-description"> Some Description</p>
                    </ProjectCard>
                  )
                }) }
              { isLoading && <Spinner text="Fetching Grant Applications"/> }
            </ProjectCardsContainer>
          </Link>
        </div>
      ))}
      {isLoading &&
        <Spinner text="Fetching Grant Applications" />
      }
    </div>
  )
}
