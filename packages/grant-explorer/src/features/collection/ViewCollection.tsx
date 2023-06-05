import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Collection, getCollectionById } from "../api/collections";
import { ProjectsWithRoundData, getProjects } from "../api/round";
import { ReactComponent as ArrowUpRight } from "../../assets/icons/arrow-up-right.svg"
import Navbar from "../common/Navbar";
// import { useCart } from "../../context/CartContext";
import { ProjectList } from "../round/ViewRoundPage";

type CollectionWithProjects = Collection & ProjectsWithRoundData & {
  chainId: string
  roundId: string
  isBeforeRoundEndDate: boolean
}

const ViewCollection = () => {
  const [collection, setCollection] = useState<CollectionWithProjects>()
  const [, setLoading] = useState<boolean>(true)
  const [searchParams] = useSearchParams()

  const loadCollection = useCallback(async (id: string) => {
    setLoading(true)
    const collectionData = await getCollectionById(id)
    const [chainId, roundId] = collectionData.round.split(':')

    const projectsId = collectionData.projects || []

    if (projectsId.length === 0) {
      console.log('No projects in this collection')
      return
    }

    const collectionRoundData = await getProjects(chainId, roundId, projectsId, true) as ProjectsWithRoundData

    const isBeforeRoundEndDate = collectionRoundData.roundEndTime > new Date();

    setCollection({
      ...collectionData,
      chainId,
      roundId,
      isBeforeRoundEndDate,
      ...collectionRoundData
    } as CollectionWithProjects)

    setLoading(false)

  }, [])

  useEffect(() => {
    const collectionData = decodeURIComponent(searchParams.get('data') || "")

    if (collectionData && collectionData.length > 0) {
      loadCollection(collectionData)
    }
  }, [searchParams, loadCollection])

  if (!collection) {
    return <div>Loading</div>
  }

  return <div>
    <Navbar
      roundUrlPath={`/round/${collection.chainId}/${collection.roundId}`}
      isBeforeRoundEndDate={collection.isBeforeRoundEndDate}
    />
    <div className="relative top-16 lg:mx-20 px-4 py-7 h-screen">
      <main>
        <div className="flex flex-1 justify-between items-end">
          <div>
            <div className="text-3xl my-5">{collection?.title} Grants Collection</div>
            <div className="text-xl mt-3 flex flex-row items-center">
              <span>
                {collection.roundMeta?.name}
              </span>
              <Link className="ml-2" to={`/round/${collection.chainId}/${collection.roundId}`} target="_blank">
                <span>
                  <ArrowUpRight />
                </span>
              </Link>
            </div>
          </div>
          {/* <div>Add all to cart</div> */}
        </div>

        <hr className="my-8" />

        <ProjectList projects={collection.projectsMeta} roundRoutePath={`/round/${collection.chainId}/${collection.roundId}`} isBeforeRoundEndDate={collection.isBeforeRoundEndDate} roundId={collection.roundId} isInCollection />
      </main>
    </div >
  </div >
}

export default ViewCollection
