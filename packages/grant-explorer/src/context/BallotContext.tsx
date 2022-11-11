import { Project } from "../features/api/types";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadFinalBallot, loadShortlist, saveFinalBallot, saveShortlist } from "../features/api/LocalStorage";
import { RoundContext } from "./RoundContext";

export interface BallotContextState {
  shortlist: Project[];
  setShortlist: React.Dispatch<SetStateAction<Project[]>>;
  finalBallot: Project[];
  setFinalBallot: React.Dispatch<SetStateAction<Project[]>>;
}

export const initialBallotState: BallotContextState = {
  shortlist: [],
  setShortlist: () => {
    /**/
  },
  finalBallot: [],
  setFinalBallot: () => {
    /**/
  },
};

export const BallotContext =
  createContext<BallotContextState>(initialBallotState);

export const BallotProvider = ({ children }: { children: ReactNode }) => {
  const roundContext = useContext(RoundContext);
  const currentRoundId = roundContext?.state?.currentRoundId;
  const [shortlist, setShortlist] = useState(initialBallotState.shortlist);
  const [finalBallot, setFinalBallot] = useState(
    initialBallotState.finalBallot
  );

  useEffect((): void => {
    if (currentRoundId) {
      const storedShortlist =
        loadShortlist(currentRoundId) ?? initialBallotState.shortlist;
      setShortlist(storedShortlist);

      const storedFinalBallot =
        loadFinalBallot(currentRoundId) ?? initialBallotState.finalBallot;
      setFinalBallot(storedFinalBallot);
    }
  }, [currentRoundId]);

  useEffect((): void => {
    if (currentRoundId) {
      saveShortlist(shortlist, currentRoundId);
    }
  }, [shortlist, currentRoundId]);

  useEffect((): void => {
    if (currentRoundId) {
      saveFinalBallot(finalBallot, currentRoundId);
    }
  }, [finalBallot, currentRoundId]);

  const providerProps: BallotContextState = {
    shortlist,
    setShortlist,
    finalBallot,
    setFinalBallot,
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
  removeProjectFromShortlist: (projectToRemove: Project) => void,
  finalBallot: BallotContextState["finalBallot"],
  handleAddtoFinalBallot: (projectsToAdd: Project[]) => void,
  handleRemoveFromFinalBallot: (projectToRemove: Project) => void
];
export const useBallot = (): UseBallot => {
  const context = useContext(BallotContext);
  if (context === undefined) {
    throw new Error("useBallot must be used within a BallotProvider");
  }

  const { shortlist, setShortlist } = context;
  const { finalBallot, setFinalBallot } = context;

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
      (project) =>
        project.projectRegistryId === projectToRemove.projectRegistryId
    );

    const newShortlist = [...shortlist];
    if (isProjectInShortlistIndex !== -1) {
      newShortlist.splice(isProjectInShortlistIndex);
    }

    setShortlist(newShortlist);
  };

  const handleAddtoFinalBallot = (projectsToAdd: Project[]): void => {

    const newFinalBallot = [...finalBallot];

    projectsToAdd.map(projectToAdd => {
      const isProjectInFinalBallot= newFinalBallot.findIndex(
        (project) => project.projectRegistryId === projectToAdd.projectRegistryId
      );

      if (isProjectInFinalBallot > -1) return;

      handleRemoveProjectFromShortlist(projectToAdd);
      newFinalBallot.push(projectToAdd);
    })

    setFinalBallot(newFinalBallot);
  };

  const handleRemoveFromFinalBallot =  (projectToRemove: Project): void => {

    const isProjectInFinalBallotIndex = finalBallot.findIndex(
      (project) => project.projectRegistryId === projectToRemove.projectRegistryId
    );

    const newFinalBallot = [...finalBallot];
    if(isProjectInFinalBallotIndex !== -1) {
      newFinalBallot.splice(isProjectInFinalBallotIndex);
    }

    setFinalBallot(newFinalBallot);

    // add project to shortlist
    handleAddProjectToShortlist(projectToRemove);
  }

  return [
    shortlist,
    handleAddProjectToShortlist,
    handleRemoveProjectFromShortlist,
    finalBallot,
    handleAddtoFinalBallot,
    handleRemoveFromFinalBallot,
  ];
};
