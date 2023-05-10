import React, { useState } from 'react'
import { Project } from '../api/types'
import CollectionsModal from './CollectionsModal'

const useCollections = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const renderModal = () => <CollectionsModal project={activeProject} closeModal={() => setActiveProject(null)} />

  return { setActiveProject, renderModal }
}

export default useCollections;