import { create } from "zustand";
import { ProgressStatus } from "../features/api/types";
import { Address } from "viem";
import { Allo } from "common";
import { error, Result } from "common/src/allo/common";

import { CreateRoundArguments } from "common/dist/allo/allo";

export type CreateRoundStoreState = {
  ipfsStatus: ProgressStatus;
  contractDeploymentStatus: ProgressStatus;
  indexingStatus: ProgressStatus;
  round: Address | undefined;
  createRound: (
    allo: Allo,
    createRoundData: CreateRoundArguments
  ) => Promise<
    Result<{
      roundId: Address;
    }>
  >;
  clearStatuses: () => void;
};

export const useCreateRoundStore = create<CreateRoundStoreState>((set) => ({
  ipfsStatus: ProgressStatus.NOT_STARTED,
  contractDeploymentStatus: ProgressStatus.NOT_STARTED,
  indexingStatus: ProgressStatus.NOT_STARTED,
  clearStatuses: () => {
    set({
      indexingStatus: ProgressStatus.NOT_STARTED,
      contractDeploymentStatus: ProgressStatus.NOT_STARTED,
      ipfsStatus: ProgressStatus.NOT_STARTED,
    });
  },
  round: undefined,
  createRound: async (allo: Allo, createRoundData: CreateRoundArguments) => {
    set({
      indexingStatus: ProgressStatus.NOT_STARTED,
      contractDeploymentStatus: ProgressStatus.NOT_STARTED,
      ipfsStatus: ProgressStatus.IN_PROGRESS,
    });

    try {
      const round = await allo
        .createRound(createRoundData)
        .on("ipfsStatus", (res) => {
          if (res.type === "success") {
            set({
              ipfsStatus: ProgressStatus.IS_SUCCESS,
              contractDeploymentStatus: ProgressStatus.IN_PROGRESS,
            });
          } else {
            set({
              ipfsStatus: ProgressStatus.IS_ERROR,
            });
          }
        })
        .on("indexingStatus", (res) => {
          if (res.type === "success") {
            set({
              indexingStatus: ProgressStatus.IS_SUCCESS,
            });
          } else {
            set({
              indexingStatus: ProgressStatus.IS_ERROR,
            });
          }
        })
        .on("transaction", (res) => {
          if (res.type === "success") {
            set({
              contractDeploymentStatus: ProgressStatus.IS_SUCCESS,
              indexingStatus: ProgressStatus.IN_PROGRESS,
            });
          } else {
            set({
              contractDeploymentStatus: ProgressStatus.IS_ERROR,
            });
          }
        })
        .on("transactionStatus", (res) => {
          if (res.type === "success") {
            set({
              contractDeploymentStatus: ProgressStatus.IS_SUCCESS,
            });
          } else {
            set({
              contractDeploymentStatus: ProgressStatus.IS_ERROR,
            });
          }
        })
        .execute();

      if (round.type === "success") {
        set({
          round: round.value.roundId,
        });
      }

      return round;
    } catch (e) {
      set({
        indexingStatus: ProgressStatus.IS_ERROR,
        contractDeploymentStatus: ProgressStatus.IS_ERROR,
        ipfsStatus: ProgressStatus.IS_ERROR,
      });

      return error(e as Error);
    }
  },
}));
