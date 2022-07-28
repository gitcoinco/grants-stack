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
  flex-wrap
  w-full
  `

  const ProjectCard = tw.div`
  w-80
  h-72
  border
  border-gray-300
  ml-0
  mr-6
  my-3
  overflow-hidden
  rounded-md
  `

  const ProjectCardHeader = tw.div`
  bg-grey-500
  w-full
  h-1/3
  `

  const ProjectCardContent = tw.div`
  p-4
  `

  const ProjectCardTitle = tw.p`
  w-full
  my-4
  text-lg
  font-normal
  text-ellipsis
  line-clamp-2
  `

  const ProjectCardDescription = tw.p`
  text-sm
  text-ellipsis
  line-clamp-2
  text-gray-500
  leading-relaxed
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
            <ProjectCardDescription>{ application.project.description }</ProjectCardDescription>
          </ProjectCardContent>
        </ProjectCard>
      )) }
      { isLoading &&
        <Spinner text="Fetching Grant Applications"/>
      }
    </ProjectCardsContainer>
  )
}
