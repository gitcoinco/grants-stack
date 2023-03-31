import { Project } from "../features/api/types";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loadFinalBallot,
  loadShortlist,
  saveFinalBallot,
  saveShortlist,
} from "../features/api/LocalStorage";
import { RoundContext } from "./RoundContext";

export interface CartContextState {
  cart: Project[];
  setCart: React.Dispatch<SetStateAction<Project[]>>;
}

export const initialBallotState: CartContextState = {
  cart: [],
  setCart: () => {
    /**/
  },
};

export const CartContext =
  createContext<CartContextState>(initialBallotState);

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

  const providerProps: CartContextState = {
    shortlist,
    setShortlist,
    finalBallot,
    setFinalBallot,
  };

  return (
    <CartContext.Provider value={providerProps}>
      {children}
    </CartContext.Provider>
  );
};

/* Custom Hooks */
type UseCart = [
  cart: CartContextState["cart"],
  handleAddProjectsToFinalBallot: (projects: Project[]) => void,
  handleRemoveProjectsFromFinalBallot: (projects: Project[]) => void,
];

export const useCart = (): UseCart => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a BallotProvider");
  }

  const { shortlist, setShortlist } = context;
  const { finalBallot, setFinalBallot } = context;

  const handleAddProjectsToShortlist = (projectsToAdd: Project[]): void => {
    // Add projects to the shortlist if they are not already present
    const newShortlist = projectsToAdd.reduce((acc, projectToAdd) => {
      const isProjectAlreadyPresent = acc.find(
        (project) =>
          project.projectRegistryId === projectToAdd.projectRegistryId
      );
      return isProjectAlreadyPresent ? acc : acc.concat(projectToAdd);
    }, shortlist);

    setShortlist(newShortlist);
  };

  const handleRemoveProjectsFromShortlist = (
    projectsToRemove: Project[]
  ): void => {
    // Remove projects from the shortlist if they are present
    const newShortlist = shortlist.filter(
      (project) =>
        !projectsToRemove.find(
          (projectToRemove) =>
            projectToRemove.projectRegistryId === project.projectRegistryId
        )
    );
    setShortlist(newShortlist);
  };

  const handleAddProjectsToFinalBallot = (projectsToAdd: Project[]): void => {
    // Add the projects to the final ballot from the shortlist and remove them from the shortlist
    const newFinalBallot = projectsToAdd.reduce((acc, projectToAdd) => {
      const isProjectAlreadyPresent = acc.find(
        (project) =>
          project.projectRegistryId === projectToAdd.projectRegistryId
      );
      return isProjectAlreadyPresent ? acc : acc.concat(projectToAdd);
    }, finalBallot);
    setFinalBallot(newFinalBallot);
    handleRemoveProjectsFromShortlist(projectsToAdd);
  };

  const handleRemoveProjectsFromFinalBallot = (
    projectsToRemove: Project[]
  ): void => {
    // Remove the projects from the final ballot and add them back to the shortlist
    const newFinalBallot = finalBallot.filter(
      (project) =>
        !projectsToRemove.find(
          (projectToRemove) =>
            projectToRemove.projectRegistryId === project.projectRegistryId
        )
    );
    setFinalBallot(newFinalBallot);
  };

  const handleRemoveProjectsFromFinalBallotAndAddToShortlist = (
    projectsToRemove: Project[]
  ): void => {
    // Remove projects from final ballot if they are present and add them back to the shortlist
    handleRemoveProjectsFromFinalBallot(projectsToRemove);
    handleAddProjectsToShortlist(projectsToRemove);
  };

  return [
    shortlist,
    finalBallot,
    handleAddProjectsToShortlist,
    handleRemoveProjectsFromShortlist,
    handleAddProjectsToFinalBallot,
    handleRemoveProjectsFromFinalBallot,
    handleRemoveProjectsFromFinalBallotAndAddToShortlist,
  ];
};
