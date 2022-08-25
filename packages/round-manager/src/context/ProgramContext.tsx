import { Program } from "../features/api/types"
import { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "../features/common/Auth"
import { listPrograms } from "../features/api/program"

export interface ProgramState {
  programs: Program[],
  isLoading: boolean,
  listProgramsError?: Error
}

export const initialProgramState: ProgramState = { programs: [], isLoading: false }
export const ProgramContext = createContext<ProgramState>(initialProgramState)

export const ProgramProvider = ({ children }: { children: any }) => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setLoading] = useState(false)
  const [listProgramsError, setListProgramsError] = useState<Error | undefined>()

  const { address, provider } = useWallet()

  useEffect(() => {
    setLoading(true)
    listPrograms(address, provider)
      .then(setPrograms)
      .catch((error) => {
        setListProgramsError(error)
        setPrograms([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [address, provider])

  const providerProps = {
    programs,
    isLoading,
    listProgramsError
  }

  return <ProgramContext.Provider value={ providerProps }>
    { children }
  </ProgramContext.Provider>
}

export const usePrograms = () => {
  const { programs, isLoading, listProgramsError } = useContext(ProgramContext)

  return { programs, isLoading, listProgramsError }
}
