import { createContext } from "react";
import { Program } from "../../features/api/types";

interface ProgramState {
  programs: Program[];
}

const initialState: ProgramState = {
  programs: [],
};

/*TODO: this seems to be implemented in /src/context, safe to delete? */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const programContext = createContext(initialState);
