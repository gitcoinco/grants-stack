/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CartProject, AttestationFrameProps } from "./features/api/types";
import { persist } from "zustand/middleware";

import { Hex } from "viem";

interface AttestationState {
  checkedOutProjectsByTx: Record<Hex, CartProject[]>;
  setCheckedOutProjectsByTx: (tx: Hex, projects: CartProject[]) => void;
  getCheckedOutProjectsByTx: (tx: Hex) => CartProject[];
  cleanCheckedOutProjects: () => void;
  getCheckedOutTransactions: () => Hex[];
  getFrameProps: (txHashes: Hex[]) => AttestationFrameProps;
}

export const useAttestationStore = create<AttestationState>()(
  persist(
    devtools((set, get) => ({
      checkedOutProjectsByTx: {},
      setCheckedOutProjectsByTx: (tx: Hex, projects: CartProject[]) => {
        set((oldState) => ({
          checkedOutProjectsByTx: {
            ...oldState.checkedOutProjectsByTx,
            [tx]: projects,
          },
        }));
      },
      getCheckedOutProjectsByTx: (tx: Hex) => {
        return get().checkedOutProjectsByTx[tx] || [];
      },
      cleanCheckedOutProjects: () => {
        set({
          checkedOutProjectsByTx: {},
        });
      },
      // Create a function that gets an array of transactionHashes and returns the FrameProps object where projects Array
      // contains the top 3 projects based on those checked out transactions max donation amount in usd
      // The top round is the round with the most funds allocated in total amount of projects allocated to all transactions in total rounds in all transaction in total chains allocated in these transactions
      getCheckedOutTransactions: () => {
        return Object.keys(get().checkedOutProjectsByTx) as Hex[];
      },
      getFrameProps: (txHashes: Hex[]) => {
        const allProjects: CartProject[] = [];
        const roundsSet = new Set<string>();
        const chainsSet = new Set<number>();
        const amountByRound: Record<
          string,
          {
            roundId: string;
            chainId: number;
            totalAmount: number;
          }
        > = {};

        if (txHashes.length === 0) {
          return {
            selectedBackground: "",
            topRound: {
              roundId: "",
              chainId: 0,
            },
            projectsFunded: 0,
            roundsSupported: 0,
            checkedOutChains: 0,
            projects: [],
          } as AttestationFrameProps;
        }

        for (const txHash of txHashes) {
          const projects = get().getCheckedOutProjectsByTx(txHash);
          allProjects.push(...projects);
          projects.forEach((project) => {
            roundsSet.add(project.roundId);
            chainsSet.add(project.chainId);
            amountByRound[project.roundId] = amountByRound[project.roundId] || {
              roundName: project.roundId,
              totalAmount: 0,
            };
            // TODO CHANGE WITH ACTUAL ROUNDNAME
            amountByRound[project.roundId].roundId = project.roundId;
            amountByRound[project.roundId].chainId = project.chainId;
            amountByRound[project.roundId].totalAmount += Number(
              project.amount
            );
          });
        }
        const topProjects = allProjects
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .slice(0, 3)
          .map((project, i) => ({
            rank: i + 1,
            name: project.projectMetadata.title,
            round: project.roundId,
            roundId: project.roundId,
            image:
              project.projectMetadata?.logoImg ??
              project.projectMetadata?.bannerImg ??
              "",
            chainId: project.chainId,
          }));
        const topRound = Object.values(amountByRound).sort(
          (a, b) => b.totalAmount - a.totalAmount
        )[0];
        return {
          selectedBackground: "",
          topRound: topRound,
          projectsFunded: allProjects.length,
          roundsSupported: roundsSet.size,
          checkedOutChains: chainsSet.size,
          projects: topProjects,
        } as AttestationFrameProps;
      },
    })),
    {
      name: "attestation-store",
      version: 1,
    }
  )
);
