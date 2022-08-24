import { Program } from "../features/api/types"
import { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "../features/common/Auth"
import { listPrograms } from "../features/api/program"

interface ProgramState {
  programs: Program[] | {}
}

const initialState: ProgramState = { programs: [] }
const ProgramContext = createContext(initialState)

export const usePrograms = (address: string, provider: any) => {
  const { programs } = useContext(ProgramContext)

  return { programs }
}

export const ProgramProvider = ({children}: {children: any}) => {
  const [programs, setPrograms] = useState<Program[] | {}>([])

  const {address, provider} = useWallet();

  useEffect(() => {
    const getPrograms = async () => {
    }

    listPrograms(address, provider)
      .then(setPrograms)
      .catch(() => {
      setPrograms([])
    })
    getPrograms()
  }, [address, provider]);

  const providerProps = {
    programs
  };

  return <ProgramContext.Provider value={providerProps}>
    {children}
  </ProgramContext.Provider>
}