import { ChainId } from "common";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { CartProject, PayoutToken } from "./features/api/types";
import { payoutTokensMap } from "./features/api/utils";
import { zeroAddress } from "viem";

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
        value.find((token) => token.address === zeroAddress) ?? value[0],
      ] as [ChainId, PayoutToken]
  )
) as Record<ChainId, PayoutToken>;

export const useCartStorage = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        projects: [],
        add: (project: CartProject) =>
          set({
            projects: [...get().projects, project],
          }),
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
        setPayoutTokenForChain: (
          chainId: ChainId,
          payoutToken: PayoutToken
        ) => {
          set({
            chainToPayoutToken: {
              ...get().chainToPayoutToken,
              [chainId]: payoutToken,
            },
          });
        },
      }),
      {
        name: "cart-storage",
      }
    )
  )
);
