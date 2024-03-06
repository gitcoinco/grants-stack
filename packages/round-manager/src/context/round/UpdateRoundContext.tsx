import { Signer } from "ethers";
import React, { SetStateAction, createContext, useContext } from "react";
import { ProgressStatus } from "../../features/api/types";
import { useWallet } from "../../features/common/Auth";
import { UpdateRoundParams } from "common/dist/types";
import { Allo } from "common";
import { Hex } from "viem";
import { datadogLogs } from "@datadog/browser-logs";

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

export type UpdateRoundData = {
  roundId: string;
  data: UpdateRoundParams;
  allo: Allo;
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
  signerOrProvider: Signer;
  updateRoundData: UpdateRoundData;
}

const _updateRound = async ({
  context,
  updateRoundData,
}: _updateRoundParams) => {
  const { setIPFSCurrentStatus, setRoundUpdateStatus, setIndexingStatus } =
    context;

  const { roundId, data, allo } = updateRoundData;

  const round = await allo.editRound({
    roundId: roundId as any as Hex,
    data,
  }).on("ipfs", (res) => {
  
    if (res.type === "success") {
      setIPFSCurrentStatus(ProgressStatus.IS_SUCCESS);
    } else {
      console.error("IPFS Error", res.error);
      datadogLogs.logger.error(`_updateRound: ${res.error}`);
      setIPFSCurrentStatus(ProgressStatus.IS_ERROR);
    }
  }).on("transactionStatus", (res) => {
    if (res.type === "success") {
      setRoundUpdateStatus(ProgressStatus.IS_SUCCESS);
    } else {
      console.error("Transaction Status Error", res.error);
      datadogLogs.logger.error(`_updateRound: ${res.error}`);
      setRoundUpdateStatus(ProgressStatus.IS_ERROR);
    }
  
  }).on("indexingStatus", (res) => {
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

  const { signer: walletSigner } = useWallet();

  const updateRound = async (updateRoundData: UpdateRoundData) => {
    setIPFSCurrentStatus(initialUpdateRoundState.IPFSCurrentStatus);
    setRoundUpdateStatus(initialUpdateRoundState.roundUpdateStatus);
    setIndexingStatus(initialUpdateRoundState.indexingStatus);

    return _updateRound({
      context,
      signerOrProvider: walletSigner as Signer,
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
