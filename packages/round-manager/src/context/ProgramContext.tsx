import { Program } from "../features/api/types"
import { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "../features/common/Auth"
import { listPrograms } from "../features/api/program"

export interface ProgramState {
  programs: Program[],
  listProgramsError?: Error
}

export const initialProgramState: ProgramState = { programs: [] }
export const ProgramContext = createContext<ProgramState>(initialProgramState)

export const ProgramProvider = ({children}: {children: any}) => {
  const [programs, setPrograms] = useState<Program[]>([])
  const [listProgramsError, setListProgramsError] = useState<Error | undefined>()

  const {address, provider} = useWallet();

  useEffect(() => {
    listPrograms(address, provider)
      .then(setPrograms)
      .catch((error) => {
        setListProgramsError(error)
        setPrograms([])
      })
  }, [address, provider]);

  const providerProps = {
    programs,
    listProgramsError
  };

  return <ProgramContext.Provider value={providerProps}>
    {children}
  </ProgramContext.Provider>
}

export const usePrograms = () => {
  const { programs, listProgramsError } = useContext(ProgramContext)

  return { programs, listProgramsError }
}
