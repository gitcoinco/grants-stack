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
  `

  const ProjectCard = tw.div`
  w-1/4
  h-60
  border-2
  border-black
  mx-2
  overflow-hidden
  rounded-sm
  `

  const ProjectCardHeader = tw.div`
  bg-black
  w-full
  h-1/4
  `

  const ProjectCardContent = tw.div`
  p-4
  `

  const ProjectCardTitle = tw.p`
  w-full
  my-4
  text-md
  font-semibold
  text-ellipsis
  `

  return (
    <ProjectCardsContainer>
      { isSuccess && data?.map((application, index) => (
        <ProjectCard key={ index } className="application-card" data-testid="application-card">
          <ProjectCardHeader/>
          <ProjectCardContent>
            <Link to={ `/round/${ id }/application/${ application.id }` }>
              <ProjectCardTitle>{ application.project.title }</ProjectCardTitle>
            </Link>
            <p>{ application.project.description }</p>
          </ProjectCardContent>
        </ProjectCard>
      )) }
      { isLoading &&
        <Spinner text="Fetching Grant Applications"/>
      }
    </ProjectCardsContainer>
  )
}
