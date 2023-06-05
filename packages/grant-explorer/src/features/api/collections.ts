import { v4 as uuid } from 'uuid'
import CryptoJS from 'crypto-js'

export type Collection = {
  title: string
  id: string
  enc?: string
  owner: `0x${string}`
  round: string
  projects: number[]
}

type CreateCollectionParams = {
  title: string
  owner: `0x${string}`
  round: string
  projects: number[]
}

const secretKey = 'grantProjects'

const parseCollections = (): string[] => {
  return JSON.parse(localStorage.getItem(`collections`) || '[]')
}

export const encodeCollection = (collection: string) => {
  return CryptoJS.AES.encrypt(collection, secretKey).toString()
}

export const createCollection = async ({ title, owner, round, projects }: CreateCollectionParams): Promise<void> => {
  const id = `collections_${round}_${uuid()}`

  localStorage.setItem(
    id,
    JSON.stringify({
      id,
      title,
      owner,
      round,
      projects,
    })
  )

  localStorage.setItem('collections', JSON.stringify(Array.from(new Set(parseCollections()).add(id))))

  document.dispatchEvent(new Event('collectionsUpdated'))
}

export const getCollectionById = async (id: string): Promise<Collection> => {
  // decrypt data
  console.log(id)
  const collection = JSON.parse(CryptoJS.AES.decrypt(id, secretKey).toString(CryptoJS.enc.Utf8))
  console.log(collection)
  // load collection data from id

  return collection as Collection
}

export const getAllCollectionsForRound = (round: string): string[] => {
  return parseCollections().filter((i) => {
    const [, roundId] = i.split('_')
    return roundId === round
  })
}

export const getAllCollections = async (round: string): Promise<Collection[]> => {
  return parseCollections()
    .filter((i) => {
      const [, roundId] = i.split('_')
      return roundId === round
    })
    .map((collectionKey) => JSON.parse(localStorage.getItem(collectionKey) || '[]'))
    .reverse()
}

export const getMyCollections = async (round: string): Promise<Collection[]> => {
  return getAllCollections(round)
}

export type AddProjectData = {
  collection: string
  project: number
}

export const addProjectToCollection = async ({ collection, project }: AddProjectData) => {
  const collectionData = JSON.parse(localStorage.getItem(collection) || '[]')
  collectionData.projects = Array.from(new Set(collectionData.projects).add(project))

  localStorage.setItem(collection, JSON.stringify(collectionData))
}
