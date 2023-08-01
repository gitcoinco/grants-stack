import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { CartProject } from "./features/api/types";

interface CartState {
  projects: CartProject[];
  add: (project: CartProject) => void;
  clear: () => void;
  remove: (grantApplicationId: string) => void;
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
      }),
      {
        name: "cart-storage",
      }
    )
  )
);
