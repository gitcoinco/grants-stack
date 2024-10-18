/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { persist } from "zustand/middleware";

import { Hex } from "viem";

interface AttestationState {
  checkedOutTransactions: Hex[];
  addCheckedOutTransaction: (tx: Hex) => void;
  getCheckedOutTransactions: () => Hex[];
  cleanCheckedOutTransactions: () => void;
}

export const useAttestationStore = create<AttestationState>()(
  persist(
    devtools((set, get) => ({
      checkedOutTransactions: [],
      addCheckedOutTransaction: (tx: Hex) => {
        set((oldState) => ({
          checkedOutTransactions: [...oldState.checkedOutTransactions, tx],
        }));
      },
      getCheckedOutTransactions: () => {
        return get().checkedOutTransactions;
      },
      cleanCheckedOutTransactions: () => {
        set({
          checkedOutTransactions: [],
        });
      },
    })),
    {
      name: "attestation-store",
      version: 1,
    }
  )
);
