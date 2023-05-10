import { Fragment, useCallback, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useParams } from "react-router-dom";
import { useAccount } from 'wagmi'
import LoadingSpin from "react-loading-spin";
import { ReactComponent as PlusIcon } from '../../assets/icons/plus.svg'
import { ReactComponent as Check } from '../../assets/icons/check.svg'
import { Project } from '../api/types'
import { Collection, addProjectToCollection, createCollection, getMyCollections } from '../api/collections'

interface Props {
  project: Project | null
  closeModal: () => void
}

const CollectionItem = (props: { name: string, id: string, addToCollectionHandler: (id: string) => Promise<void> }) => {
  const [added, setAdded] = useState<boolean>(false)

  const ActiveIcon = added ? Check : PlusIcon

  const handlerAdd = async () => {
    await props.addToCollectionHandler(props.id);
    setAdded(true);

    setTimeout(() => setAdded(false), 1000);
  }

  return (<div className="text-sm text-gray-500 flex flex-1 mt-3 items-center justify-between hover:bg-gray-200 py-2" aria-role='button' onClick={handlerAdd}>
    <span>{props.name}</span>
    <span>
      <ActiveIcon className='w-4 h-4' />
    </span>
  </div>)
}

const CollectionsModal = ({ project, closeModal }: Props) => {
  const [newCollection, setNewCollection] = useState<string>('');
  const [myCollections, setMyCollections] = useState<Collection[]>([])
  const [creatingCollection, setCreatingCollection] = useState<boolean>(false)
  const [loadingCollections, setLoadingCollections] = useState<boolean>(false)
  const { address } = useAccount();
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
    addProjectToCollection({
      collection,
      project: Number(project?.applicationIndex)
    })
  }, [project]);

  useEffect(() => {
    if (project?.grantApplicationId) {
      loadMyCollections();
    }
  }, [project, loadMyCollections])

  return (<Transition appear show={(project?.grantApplicationId.length || 0) > 0} as={Fragment}>
    <Dialog as="div" className="relative z-10" onClose={closeModal}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Add to your collections
              </Dialog.Title>
              <div className="mt-4 z-30">
                <div className='mb-4 text-sm'>
                  <form className='w-full relative' onSubmit={async (e) => {
                    e.preventDefault()
                    console.log('Creating collection')
                    setCreatingCollection(true)
                    await createCollection({
                      title: newCollection,
                      owner: address as `0x${string}`,
                      round: `${chainId}:${roundId}`
                    });
                    await resetCollections(`${chainId}:${roundId}`);
                    setNewCollection("")
                    setCreatingCollection(false)
                  }}>
                    <input type='text' placeholder='Create a new collection...' className='flex flex-1 w-full text-sm' value={newCollection} onChange={(e) => setNewCollection(e.target.value)} disabled={creatingCollection} />
                    {creatingCollection && <span className='absolute right-3 top-3'>
                      <LoadingSpin size="10px" />
                    </span>}
                  </form>
                </div>
                {/* <CollectionItem name='Default collection' id='default' addToCollectionHandler={() => null} /> */}

                {loadingCollections && <div className='flex flex-1 items-center justify-center mt-4 text-sm'>Loading...</div>}

                {myCollections.length === 0 && !loadingCollections && <div className='flex flex-1 items-center justify-center my-4 text-sm'>
                  You currently have no collections, create one to start curation.
                </div>}

                {!loadingCollections && myCollections.map((collectionItem) => <CollectionItem name={collectionItem.title} id={collectionItem.id} addToCollectionHandler={addToCollection} />)}
              </div>

              {!loadingCollections && <div className="mt-4 flex flex-1 w-full justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={closeModal}
                >
                  Done!
                </button>
              </div>}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>)
}

export default CollectionsModal;