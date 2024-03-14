import React, { SetStateAction, createContext, useContext } from "react";
import { ProgressStatus } from "../../features/api/types";
import { RoundCategory, UpdateRoundParams } from "common/dist/types";
import { Allo } from "common";
import { Hex } from "viem";
import { datadogLogs } from "@datadog/browser-logs";

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

export type UpdateRoundData = {
  roundId: string;
  roundAddress: Hex;
  data: UpdateRoundParams;
  allo: Allo;
  roundCategory?: RoundCategory;
};

export interface UpdateRoundState {
  IPFSCurrentStatus: ProgressStatus;
  setIPFSCurrentStatus: SetStatusFn;
  roundUpdateStatus: ProgressStatus;
  setRoundUpdateStatus: SetStatusFn;
  indexingStatus: ProgressStatus;
  setIndexingStatus: SetStatusFn;
}

export const initialUpdateRoundState: UpdateRoundState = {
  IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
  setIPFSCurrentStatus: () => {
    /* empty */
  },
  roundUpdateStatus: ProgressStatus.NOT_STARTED,
  setRoundUpdateStatus: () => {
    /* empty */
  },
  indexingStatus: ProgressStatus.NOT_STARTED,
  setIndexingStatus: () => {
    /* empty */
  },
};

export const UpdateRoundContext = createContext<UpdateRoundState>(
  initialUpdateRoundState
);

export const UpdateRoundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [IPFSCurrentStatus, setIPFSCurrentStatus] =
    React.useState<ProgressStatus>(initialUpdateRoundState.IPFSCurrentStatus);
  const [roundUpdateStatus, setRoundUpdateStatus] =
    React.useState<ProgressStatus>(initialUpdateRoundState.roundUpdateStatus);

  const [indexingStatus, setIndexingStatus] = React.useState<ProgressStatus>(
    initialUpdateRoundState.indexingStatus
  );

  const providerProps: UpdateRoundState = {
    IPFSCurrentStatus,
    setIPFSCurrentStatus,
    roundUpdateStatus,
    setRoundUpdateStatus,
    indexingStatus,
    setIndexingStatus,
  };

  return (
    <UpdateRoundContext.Provider value={providerProps}>
      {children}
    </UpdateRoundContext.Provider>
  );
};

interface _updateRoundParams {
  context: UpdateRoundState;
  updateRoundData: UpdateRoundData;
}

const _updateRound = async ({
  context,
  updateRoundData,
}: _updateRoundParams) => {
  const { setIPFSCurrentStatus, setRoundUpdateStatus, setIndexingStatus } =
    context;

  const { roundId, roundAddress, data, allo, roundCategory } = updateRoundData;

  let id;
  if (!roundId.toString().startsWith("0x")) {
    id = Number(roundId);
  } else {
    id = roundId as Hex;
  }

  if (data.applicationMetadata || data.roundMetadata) {
    setIPFSCurrentStatus(ProgressStatus.IN_PROGRESS);
  } else {
    setRoundUpdateStatus(ProgressStatus.IN_PROGRESS);
  }

  await allo
    .editRound({
      roundId: id,
      roundAddress,
      data,
      strategy: roundCategory,
    })
    .on("ipfs", (res) => {
      if (res.type === "success") {
        setIPFSCurrentStatus(ProgressStatus.IS_SUCCESS);
        setRoundUpdateStatus(ProgressStatus.IN_PROGRESS);
      } else {
        console.error("IPFS Error", res.error);
        datadogLogs.logger.error(`_updateRound: ${res.error}`);
        setIPFSCurrentStatus(ProgressStatus.IS_ERROR);
      }
    })
    .on("transactionStatus", (res) => {
      if (res.type === "success") {
        setRoundUpdateStatus(ProgressStatus.IS_SUCCESS);
        setIndexingStatus(ProgressStatus.IN_PROGRESS);
      } else {
        console.error("Transaction Status Error", res.error);
        datadogLogs.logger.error(`_updateRound: ${res.error}`);
        setRoundUpdateStatus(ProgressStatus.IS_ERROR);
      }
    })
    .on("indexingStatus", (res) => {
      if (res.type === "success") {
        setIndexingStatus(ProgressStatus.IS_SUCCESS);
      } else {
        console.error("Indexing Status Error", res.error);
        datadogLogs.logger.error(`_updateRound: ${res.error}`);
        setIndexingStatus(ProgressStatus.IS_ERROR);
      }
    })
    .execute();
};

export const useUpdateRound = () => {
  const context = useContext(UpdateRoundContext);
  if (!context) throw new Error("Missing UpdateRoundContext");

  const { setIPFSCurrentStatus, setRoundUpdateStatus, setIndexingStatus } =
    context;

  const updateRound = async (updateRoundData: UpdateRoundData) => {
    setIPFSCurrentStatus(initialUpdateRoundState.IPFSCurrentStatus);
    setRoundUpdateStatus(initialUpdateRoundState.roundUpdateStatus);
    setIndexingStatus(initialUpdateRoundState.indexingStatus);

    return _updateRound({
      context,
      updateRoundData,
    });
  };

  return {
    updateRound,
    IPFSCurrentStatus: context.IPFSCurrentStatus,
    roundUpdateStatus: context.roundUpdateStatus,
    indexingStatus: context.indexingStatus,
  };
};
