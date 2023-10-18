import { useCallback, useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { useAccount } from 'wagmi'
import Modal from './Modal';
import { Project } from '../api/types'
import { Collection, addProjectToCollection, createCollection, getMyCollections } from '../api/collections'
import { ReactComponent as PlusIcon } from '../../assets/icons/plus.svg'
import { getProjects } from '../api/round';
import CollectionBanner from './CollectionBanner';
import { Button, Input } from 'common/src/styles';

interface Props {
  open: boolean
  project: Project | null
  closeModal: () => void
}

interface AllCollectionsProp extends Props {
  createNewCollection: () => void
}

const CollectionItem = (props: { name: string, id: string, projects: number[], addToCollectionHandler: (id: string) => Promise<void> }) => {
  const { chainId, roundId } = useParams();
  const [projectsImages, setProjectsImages] = useState<string[]>([])

  const loadCollectionProjects = useCallback(async () => {
    const collectionRoundData = await getProjects(chainId, roundId as string, props.projects, false) as Project[]

    setProjectsImages(collectionRoundData.map((i) => i.projectMetadata.bannerImg || "").slice(0, 4))
  }, [chainId, props.projects, roundId])

  const handlerAdd = async () => {
    await props.addToCollectionHandler(props.id);
  }

  useEffect(() => {
    loadCollectionProjects()
  }, [loadCollectionProjects])

  return (<div className='flex flex-1 justify-between mb-4 text-base p-4 bg-grey-150 items-center' aria-role='button' onClick={handlerAdd}>
    <div className='flex flex-col text-sm'>
      <span className='text-grey-500'>{props.name}</span>
      <span className='mt-1 text-grey-400'>{props.projects.length} project{props.projects.length !== 1 ? "s" : ""}</span>
    </div>
    <div className='h-[56px] w-[112px] bg-white rounded'>
      {projectsImages.length > 0 && <CollectionBanner height={56} images={projectsImages} />}
    </div>
  </div>)
}

export const CollectionsModal = ({ project, open, createNewCollection, closeModal }: AllCollectionsProp) => {
  const [myCollections, setMyCollections] = useState<Collection[]>([])
  const [loadingCollections, setLoadingCollections] = useState<boolean>(false)
  const { chainId, roundId } = useParams();

  const resetCollections = useCallback(async (round: string) => {
    setMyCollections(await getMyCollections(round));
  }, [])

  const loadMyCollections = useCallback(async () => {
    setLoadingCollections(true)
    resetCollections(`${chainId}:${roundId}`)
    setLoadingCollections(false)
  }, [resetCollections, chainId, roundId])

  const addToCollection = useCallback(async (collection: string) => {
    await addProjectToCollection({
      collection,
      project: Number(project?.applicationIndex)
    })
    closeModal()
  }, [closeModal, project?.applicationIndex]);

  useEffect(() => {
    if (project?.grantApplicationId) {
      loadMyCollections();
    }
  }, [project, loadMyCollections])

  return (<Modal title="Choose a list" open={open} closeModal={closeModal}>

    <div className="mt-4 z-30">
      <div className='flex flex-1 justify-between mb-4 text-base p-4 bg-grey-150 items-center' role="button" onClick={createNewCollection}>
        <div className='text-sm'>Create List</div>
        <button className='flex items-center justify-center bg-white w-28 py-5'>
          <PlusIcon className='w-4 h-4' strokeWidth={2} />
        </button>
      </div>

      {loadingCollections && <div className='flex flex-1 items-center justify-center mt-4 text-sm'>Loading...</div>}

      {myCollections.length === 0 && !loadingCollections && <div className='flex flex-1 items-center justify-center my-4 text-sm'>
        You currently have no collections, create one to start curation.
      </div>}

      {!loadingCollections && myCollections.map((collectionItem) => <CollectionItem name={collectionItem.title} id={collectionItem.id} addToCollectionHandler={addToCollection} projects={collectionItem.projects} />)}
    </div>

    {!loadingCollections && <div className="mt-4 flex flex-1 w-full justify-end">
      <button
        type="button"
        className="inline-flex justify-center rounded-md border bg-white px-6 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-500 focus-visible:ring-offset-2"
        onClick={closeModal}
      >
        Cancel
      </button>
    </div>}
  </Modal>)
}

export const NewCollectionsModal = ({ open, closeModal, project }: Props) => {
  const [newCollection, setNewCollection] = useState<string>("")
  const { address } = useAccount();
  const { chainId, roundId } = useParams();

  return (<Modal title="Name your list" open={open} closeModal={closeModal}>
    <div className="mt-4 z-30">
      <div className='mb-4 text-sm'>
        <form className='w-full relative' onSubmit={async (e) => {
          e.preventDefault()
          await createCollection({
            title: newCollection,
            owner: address as `0x${string}`,
            round: `${chainId}:${roundId}`,
            projects: [Number(project?.applicationIndex)]
          });
          setNewCollection("")
          closeModal()
        }}>
          <Input type='text' placeholder='Create a new list...' value={newCollection} onChange={(e) => setNewCollection(e.target.value)} />

          <div className="mt-4 flex flex-1 w-full justify-end">
            <Button type="submit" $variant='secondary'>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  </Modal>)
}