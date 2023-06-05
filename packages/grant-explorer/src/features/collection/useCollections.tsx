import { useCallback, useState } from 'react'
import { Project } from '../api/types'
import { CollectionsModal, NewCollectionsModal } from './CollectionsModal'

enum CurrentModal {
  NONE,
  ALLCOLLECTIONS,
  NEWCOLLECTIONS
}

const useCollections = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [currentModal, setCurrentModal] = useState<CurrentModal>(CurrentModal.NONE)

  const openModal = useCallback((project: Project) => {
    setActiveProject(project)
    setCurrentModal(CurrentModal.ALLCOLLECTIONS)
  }, [])

  const closeModal = useCallback(() => {
    setCurrentModal(CurrentModal.NONE)
    setActiveProject(null)
  }, [])

  const renderModal = () => <>
    <CollectionsModal project={activeProject} open={currentModal === CurrentModal.ALLCOLLECTIONS} createNewCollection={() => setCurrentModal(CurrentModal.NEWCOLLECTIONS)} closeModal={closeModal} />
    <NewCollectionsModal project={activeProject} open={currentModal === CurrentModal.NEWCOLLECTIONS} closeModal={closeModal} />
  </>

  return { setActiveProject: openModal, renderModal }
}

export default useCollections;