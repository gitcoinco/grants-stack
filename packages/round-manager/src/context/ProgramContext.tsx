import { Program } from "../features/api/types"
import { createContext, useContext } from "react"

interface ProgramState {
  programs: Program[]
}

const initialState: ProgramState = { programs: [] }
const programContext = createContext(initialState)

export const usePrograms = () => {
  const { programs } = useContext(programContext)
  return { programs }
}

