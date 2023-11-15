import { ChainId } from "common";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartProject, VotingToken } from "./features/api/types";
import { votingTokensMap } from "./features/api/utils";
import { zeroAddress } from "viem";

interface CartState {
  projects: CartProject[];
  add: (project: CartProject) => void;
  clear: () => void;
  remove: (grantApplicationId: string) => void;
  updateDonationsForChain: (chainId: ChainId, amount: string) => void;
  updateDonationAmount: (grantApplicationId: string, amount: string) => void;
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

export const useCartStorage = create<CartState>()(
  persist(
    (set, get) => ({
      projects: [],
      add: (project: CartProject) => {
        // TODO: shouldn't we be checking for the applicationId instead?
        // this might lead to multiple projects being added because the object
        // is not exactly the same
        if (get().projects.includes(project)) {
          return;
        }
        set({
          projects: [...get().projects, project],
        });
      },
      /** @param grantApplicationId - ${roundAddress}-${applicationId} */
      remove: (grantApplicationId: string) => {
        set({
          projects: get().projects.filter(
            (proj) => proj.grantApplicationId !== grantApplicationId
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
      updateDonationAmount: (grantApplicationId: string, amount: string) => {
        if (amount.includes("-")) {
          return;
        }

        const projectIndex = get().projects.findIndex(
          (donation) => donation.grantApplicationId === grantApplicationId
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
          console.warn(
            "Tried setting payoutToken",
            payoutToken,
            "for chain",
            chainId,
            ", but chain",
            chainId,
            " doesn't exist"
          );
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
