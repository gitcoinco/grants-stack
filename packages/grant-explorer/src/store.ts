import { ChainId } from "common";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { CartProject } from "./features/api/types";

interface CartState {
  projects: CartProject[];
  add: (project: CartProject) => void;
  clear: () => void;
  remove: (grantApplicationId: string) => void;
  updateDonationsForChain: (chainId: ChainId, amount: string) => void;
  updateDonationAmount: (grantApplicationId: string, amount: string) => void;
}

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
      }),
      {
        name: "cart-storage",
      }
    )
  )
);
