/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { persist } from "zustand/middleware";

import { Hex } from "viem";

interface AttestationState {
  checkedOutTransactions: Record<Hex, Hex[]>;
  addCheckedOutTransaction: (tx: Hex, address?: Hex) => void;
  getCheckedOutTransactions: (address?: Hex) => Hex[];
  cleanCheckedOutTransactions: () => void;
}

export const useAttestationStore = create<AttestationState>()(
  persist(
    devtools((set, get) => ({
      checkedOutTransactions: {},
      addCheckedOutTransaction: (tx: Hex, address?: Hex) => {
        if (!address) {
          return;
        }
        set((oldState) => ({
          checkedOutTransactions: {
            ...oldState.checkedOutTransactions,
            [address]: [
              ...(oldState.checkedOutTransactions[address] || []),
              tx,
            ],
          },
        }));
      },
      getCheckedOutTransactions: (address?: Hex) => {
        if (!address) {
          return [];
        }
        return get().checkedOutTransactions[address] || [];
      },
      cleanCheckedOutTransactions: () => {
        set({
          checkedOutTransactions: {},
        });
      },
    })),
    {
      name: "attestation-store",
      version: 1.01,
    }
  )
);
