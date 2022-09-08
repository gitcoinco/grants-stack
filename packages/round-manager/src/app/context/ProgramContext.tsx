import { createContext } from "react";
import { Program } from "../../features/api/types";

interface ProgramState {
  programs: Program[];
}

const initialState: ProgramState = {
  programs: [],
};

const programContext = createContext(initialState);
