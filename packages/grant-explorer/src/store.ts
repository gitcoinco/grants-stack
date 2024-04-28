import { ChainId, VotingToken } from "common";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartProject } from "./features/api/types";
import { votingTokensMap } from "./features/api/utils";
import { zeroAddress } from "viem";

interface CartState {
  projects: CartProject[];
  add: (project: CartProject) => void;
  clear: () => void;
  remove: (project: CartProject) => void;
  updateDonationsForChain: (chainId: ChainId, amount: string) => void;
  updateDonationAmount: (
    chainId: ChainId,
    roundId: string,
    grantApplicationId: string,
    amount: string
  ) => void;
  setCart: (projects: CartProject[]) => void;
  chainToVotingToken: Record<ChainId, VotingToken>;
  getVotingTokenForChain: (chainId: ChainId) => VotingToken;
  setVotingTokenForChain: (chainId: ChainId, votingToken: VotingToken) => void;
}

/**
 * Consumes an array of voting tokens and returns the default one.
 * If there's no default one, return the first one.
 * If the array is empty,
 * return the native token for the chain (Although this should never happen)
 * */
function getDefaultVotingToken(votingTokens: VotingToken[], chainId: ChainId) {
  return (
    votingTokens.find((token) => token.defaultForVoting && token.canVote) ??
    votingTokens[0] ?? {
      chainId,
      canVote: true,
      defaultForVoting: true,
      decimal: 18,
      name: "Native Token",
      address: zeroAddress,
    }
  );
}

const defaultVotingTokens = Object.fromEntries(
  Object.entries(votingTokensMap).map(([key, value]) => {
    return [
      Number(key) as ChainId,
      getDefaultVotingToken(value, Number(key) as ChainId),
    ] as [ChainId, VotingToken];
  })
) as Record<ChainId, VotingToken>;

function isSameProject(a: CartProject, b: CartProject): boolean {
  return (
    a.grantApplicationId.toLowerCase() === b.grantApplicationId.toLowerCase() &&
    a.chainId === b.chainId &&
    a.roundId === b.roundId
  );
}

function updateOrInsertCartProject(
  currentProjects: CartProject[],
  newProject: CartProject
): CartProject[] {
  const initialAcc: {
    projects: CartProject[];
    hasUpdatedProject: boolean;
  } = {
    projects: [],
    hasUpdatedProject: false,
  };

  const result = currentProjects.reduce((acc, project) => {
    if (isSameProject(project, newProject)) {
      return {
        projects: [...acc.projects, newProject],
        hasUpdatedProject: true,
      };
    } else {
      return { ...acc, projects: [...acc.projects, project] };
    }
  }, initialAcc);

  return result.hasUpdatedProject
    ? result.projects
    : [...currentProjects, newProject];
}

export const useCartStorage = create<CartState>()(
  persist(
    (set, get) => ({
      projects: [],

      setCart: (projects: CartProject[]) => {
        set({
          projects,
        });
      },

      add: (newProject: CartProject) => {
        const currentProjects = get().projects;

        set({
          projects: updateOrInsertCartProject(currentProjects, newProject),
        });
      },

      /** @param grantApplicationId - ${roundAddress}-${applicationId} */
      remove: (projectToRemove) => {
        set({
          projects: get().projects.filter(
            (proj) =>
              proj.grantApplicationId !== projectToRemove.grantApplicationId ||
              proj.chainId !== projectToRemove.chainId ||
              proj.roundId !== projectToRemove.roundId
          ),
        });
      },
      clear: () => {
        set({
          projects: [],
        });
      },
      updateDonationsForChain: (chainId: ChainId, amount: string) => {
        const newState = get().projects.map((project) => ({
          ...project,
          amount: project.chainId === chainId ? amount : project.amount,
        }));

        set({
          projects: newState,
        });
      },
      updateDonationAmount: (
        chainId: ChainId,
        roundId: string,
        grantApplicationId: string,
        amount: string
      ) => {
        if (amount.includes("-")) {
          return;
        }

        const projectIndex = get().projects.findIndex(
          (donation) =>
            donation.chainId === chainId &&
            donation.roundId === roundId &&
            donation.grantApplicationId === grantApplicationId
        );

        if (projectIndex !== -1) {
          const newState = [...get().projects];
          newState[projectIndex].amount = amount;
          set({
            projects: newState,
          });
        }
      },
      chainToVotingToken: defaultVotingTokens,
      getVotingTokenForChain: (chainId: ChainId) => {
        const tokenFromStore = get().chainToVotingToken[chainId];
        if (!tokenFromStore) {
          const defaultToken = getDefaultVotingToken(
            votingTokensMap[chainId],
            chainId
          );
          console.log(
            "no token for chain",
            chainId,
            " defaulting to ",
            defaultToken,
            " and setting it as the default token for that chain"
          );

          get().setVotingTokenForChain(chainId, defaultToken);
          return defaultToken;
        } else {
          return tokenFromStore;
        }
      },
      setVotingTokenForChain: (chainId: ChainId, payoutToken: VotingToken) => {
        if (!Object.values(ChainId).includes(chainId)) {
          if (process.env.NODE_ENV !== "test") {
            console.warn(
              "Tried setting payoutToken",
              payoutToken,
              "for chain",
              chainId,
              ", but chain",
              chainId,
              " doesn't exist"
            );
          }
          return;
        }

        set({
          chainToVotingToken: {
            ...get().chainToVotingToken,
            [chainId]: payoutToken,
          },
        });
      },
    }),
    {
      name: "cart-storage",
      version: 3,
    }
  )
);
