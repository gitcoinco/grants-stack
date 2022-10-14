import { Project } from "../features/api/types";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadShortlist, saveShortlist } from "../features/api/LocalStorage";
import { RoundContext } from "./RoundContext";

export interface BallotContextState {
  shortlist: Project[];
  setShortlist: React.Dispatch<SetStateAction<Project[]>>;
}

export const initialBallotState: BallotContextState = {
  shortlist: [],
  setShortlist: () => {
    /**/
  },
};

export const BallotContext =
  createContext<BallotContextState>(initialBallotState);

export const BallotProvider = ({ children }: { children: ReactNode }) => {
  const roundContext = useContext(RoundContext);
  const currentRoundId = roundContext?.state?.currentRoundId;
  const [shortlist, setShortlist] = useState(initialBallotState.shortlist);

  useEffect((): void => {
    if (currentRoundId) {
      const storedShortlist =
        loadShortlist(currentRoundId) ?? initialBallotState.shortlist;
      setShortlist(storedShortlist);
    }
  }, [currentRoundId]);

  useEffect((): void => {
    if (currentRoundId) {
      saveShortlist(shortlist, currentRoundId);
    }
  }, [shortlist, currentRoundId]);

  const providerProps: BallotContextState = {
    shortlist,
    setShortlist,
  };

  return (
    <BallotContext.Provider value={providerProps}>
      {children}
    </BallotContext.Provider>
  );
};

/* Custom Hooks */
type UseBallot = [
  shortlist: BallotContextState["shortlist"],
  addProjectToShortlist: (projectToAdd: Project) => void,
  removeProjectFromShortlist: (projectToRemove: Project) => void
];
export const useBallot = (): UseBallot => {
  const context = useContext(BallotContext);
  if (context === undefined) {
    throw new Error("useBallot must be used within a BallotProvider");
  }

  const { shortlist, setShortlist } = context;

  const handleAddProjectToShortlist = (projectToAdd: Project): void => {
    const isProjectAlreadyPresent = shortlist.find(
      (project) => project.projectRegistryId === projectToAdd.projectRegistryId
    );
    const newShortlist = isProjectAlreadyPresent
      ? shortlist
      : shortlist.concat(projectToAdd);
    setShortlist(newShortlist);
  };

  const handleRemoveProjectFromShortlist = (projectToRemove: Project): void => {
    const isProjectInShortlistIndex = shortlist.findIndex(
      (project) => project.projectRegistryId === projectToRemove.projectRegistryId
    );

    const newShortlist = [...shortlist];
    if(isProjectInShortlistIndex !== -1) {
      newShortlist.splice(isProjectInShortlistIndex);
    }

    setShortlist(newShortlist);
  };

  return [
    shortlist,
    handleAddProjectToShortlist,
    handleRemoveProjectFromShortlist
  ];
};
