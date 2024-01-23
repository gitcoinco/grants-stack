import { create } from "zustand";
import { ProgressStatus } from "../features/api/types";
import { Address } from "viem";
import { CreateRoundData } from "common/dist/types";
import { Allo } from "common";
import { Result } from "common/src/allo/common";

type CreateRoundStoreState = {
  ipfsStatus: ProgressStatus;
  contractDeploymentStatus: ProgressStatus;
  indexingStatus: ProgressStatus;
  round: Address | undefined;
  createRound: (
    allo: Allo,
    createRoundData: CreateRoundData
  ) => Promise<Result<Address>>;
};

export const useCreateRoundStore = create<CreateRoundStoreState>((set) => ({
  ipfsStatus: ProgressStatus.NOT_STARTED,
  contractDeploymentStatus: ProgressStatus.NOT_STARTED,
  indexingStatus: ProgressStatus.NOT_STARTED,
  setIndexingStatus: (status: ProgressStatus) => {
    set({
      indexingStatus: status,
    });
  },
  round: undefined,
  createRound: async (allo: Allo, createRoundData: CreateRoundData) => {
    set({
      indexingStatus: ProgressStatus.IN_PROGRESS,
      contractDeploymentStatus: ProgressStatus.IN_PROGRESS,
      ipfsStatus: ProgressStatus.IN_PROGRESS,
    });

    const round = await allo
      .createRound({
        roundData: createRoundData,
      })
      .on("ipfsStatus", (res) => {
        if (res.type === "success") {
          set({
            ipfsStatus: ProgressStatus.IS_SUCCESS,
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

    return round;
  },
}));
