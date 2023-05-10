import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Collection, encodeCollection, getAllCollections } from '../api/collections'
import { Project } from '../api/types'
import { BasicCard, CardsContainer, CardHeader, CardContent, CardTitle, CardDescription } from '../common/styles'
import { ProjectBanner } from '../common/ProjectBanner'
import classnames from 'classnames'
import { getProjects } from '../api/round'

type Props = {
  projects?: Project[]
}

function formatAddress(address: `0x${string}`): string {
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

type CollectionItemProps = {
  collection: Collection
}

function CollectionItem({ collection }: CollectionItemProps) {
  const [projectsInCollection, setProjectsInCollection] = useState<Project[]>([])
  const { chainId, roundId } = useParams()

  const loadProjects = useCallback(async (projects: number[]) => {
    setProjectsInCollection((await getProjects(chainId, roundId as string, projects)) as Project[])
  }, [chainId, roundId])

  useEffect(() => {
    if (collection && collection.projects?.length > 0) {
      loadProjects(collection.projects)
    }
  }, [collection, loadProjects])

  return (<BasicCard className="relative" data-testid="collections-card">
    <Link
      to={`/collection?data=${collection.enc}`}
      target="_blank"
      data-testid="collection-details-link"
    >
      <CardHeader>
        <div className='grid grid-cols-2 h-[180px]'>
          {projectsInCollection.map((p, i) => <ProjectBanner
            projectMetadata={p.projectMetadata}

            classNameOverride={
              classnames("bg-black h-[90px] w-full object-cover m-0", {
                'rounded-tl': i === 0,
                'rounded-tr': i === 1
              })
            }
            resizeHeight={80}
          />)}
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <CardTitle data-testid="project-title">
          {collection.title}
        </CardTitle>
        <CardDescription className="mb-2 mt-0" data-testid="project-owner">
          by {formatAddress(collection.owner)}
        </CardDescription>
        {/* <CardDescription
      data-testid="project-description"
      className="h-[150px] overflow-hidden mb-1"
    >
      {renderToPlainText(project.projectMetadata.description)}
    </CardDescription> */}
      </CardContent>
    </Link>
  </BasicCard>)
}

const AllCollectionsView = ({ projects }: Props) => {
  const [collections, setCollections] = useState<Collection[]>([])
  const [, setLoadingCollections] = useState<boolean>(false)
  const { chainId, roundId } = useParams();

  const loadAllCollections = useCallback(async (round: string) => {
    setLoadingCollections(true)
    const _collections = await getAllCollections(round)
    setCollections(_collections.map((i) => ({ ...i, enc: encodeURIComponent(encodeCollection(JSON.stringify(i))) })))
    setLoadingCollections(false)
  }, [])

  useEffect(() => {
    // load all the collections for this round here
    loadAllCollections(`${chainId}:${roundId}`);
  }, [chainId, roundId, projects, loadAllCollections])

  return (<div className='w-full flex flex-1'>
    <CardsContainer>
      {collections.map((collection) => <CollectionItem collection={collection} />)}
    </CardsContainer>
  </div>)
}

export default AllCollectionsView