import { ChainId } from "common";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartProject, PayoutToken } from "./features/api/types";
import { payoutTokensMap } from "./features/api/utils";

interface CartState {
  projects: CartProject[];
  add: (project: CartProject) => void;
  clear: () => void;
  remove: (grantApplicationId: string) => void;
  updateDonationsForChain: (chainId: ChainId, amount: string) => void;
  updateDonationAmount: (grantApplicationId: string, amount: string) => void;
  chainToPayoutToken: Record<ChainId, PayoutToken>;
  setPayoutTokenForChain: (chainId: ChainId, payoutToken: PayoutToken) => void;
}

const ethOnlyPayoutTokens = Object.fromEntries(
  Object.entries(payoutTokensMap).map(
    ([key, value]) =>
      [
        Number(key) as ChainId,
        value.find((token) => token.defaultForVoting && token.canVote) ??
          value[0],
      ] as [ChainId, PayoutToken]
  )
) as Record<ChainId, PayoutToken>;

export const useCartStorage = create<CartState>()(
  persist(
    (set, get) => ({
      projects: [],
      add: (project: CartProject) => {
        if (get().projects.includes(project)) {
          return;
        }
        set({
          projects: [...get().projects, project],
        });
      },
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
      chainToPayoutToken: ethOnlyPayoutTokens,
      setPayoutTokenForChain: (chainId: ChainId, payoutToken: PayoutToken) => {
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
          chainToPayoutToken: {
            ...get().chainToPayoutToken,
            [chainId]: payoutToken,
          },
        });
      },
    }),
    {
      /*This is the localStorage key. Change this whenever the shape of the stores objects changes. append a v1, v2. etc. */
      name: "cart-storage",
      version: 2,
    }
  )
);
