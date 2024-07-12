import { datadogLogs } from "@datadog/browser-logs";
import { ethers } from "ethers";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

import { Allo, TToken } from "common";
import { ProgressStatus } from "../../api/types";
import { getAddress } from "viem";

export interface DirectAllocationState {
  tokenApprovalStatus: ProgressStatus;
  setTokenApprovalStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
  fundStatus: ProgressStatus;
  setFundStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
  indexingStatus: ProgressStatus;
  setIndexingStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
  txHash: string;
  setTxHash: React.Dispatch<SetStateAction<string>>;
  txBlockNumber: number;
  setTxBlockNumber: React.Dispatch<SetStateAction<number>>;
}

export type DirectAllocationParams = {
  allo: Allo;
  poolId: string;
  fundAmount: number;
  payoutToken: TToken;
  recipient: string;
  nonce: bigint;
  requireTokenApproval?: boolean;
};

type SubmitFundParams = DirectAllocationParams & {
  context: DirectAllocationState;
};

export const DirectAllocationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [tokenApprovalStatus, setTokenApprovalStatus] = useState(
    initialDirectAllocationState.tokenApprovalStatus
  );
  const [fundStatus, setFundStatus] = useState(
    initialDirectAllocationState.fundStatus
  );
  const [indexingStatus, setIndexingStatus] = useState(
    initialDirectAllocationState.indexingStatus
  );
  const [txHash, setTxHash] = useState(initialDirectAllocationState.txHash);
  const [txBlockNumber, setTxBlockNumber] = useState(
    initialDirectAllocationState.txBlockNumber
  );

  const providerProps: DirectAllocationState = {
    tokenApprovalStatus,
    setTokenApprovalStatus,
    fundStatus,
    setFundStatus,
    indexingStatus,
    setIndexingStatus,
    txHash,
    setTxHash,
    txBlockNumber,
    setTxBlockNumber,
  };

  return (
    <DirectAllocationContext.Provider value={providerProps}>
      {children}
    </DirectAllocationContext.Provider>
  );
};

export const initialDirectAllocationState: DirectAllocationState = {
  tokenApprovalStatus: ProgressStatus.NOT_STARTED,
  setTokenApprovalStatus: () => {
    /**/
  },
  fundStatus: ProgressStatus.NOT_STARTED,
  setFundStatus: () => {
    /**/
  },
  indexingStatus: ProgressStatus.NOT_STARTED,
  setIndexingStatus: () => {
    /**/
  },
  txHash: "",
  setTxHash: () => {
    /**/
  },
  txBlockNumber: -1,
  setTxBlockNumber: () => {
    /**/
  },
};

export const DirectAllocationContext = createContext<DirectAllocationState>(
  initialDirectAllocationState
);

export const useDirectAllocation = () => {
  const context = useContext<DirectAllocationState>(DirectAllocationContext);
  if (context === undefined) {
    throw new Error(
      "useDirectAllocation must be used within a DirectAllocationProvider"
    );
  }

  const handleDirectAllocation = async (params: DirectAllocationParams) => {
    return _directAllocation({
      ...params,
      context,
    });
  };
  return {
    directAllocation: handleDirectAllocation,
    tokenApprovalStatus: context.tokenApprovalStatus,
    fundStatus: context.fundStatus,
    indexingStatus: context.indexingStatus,
    txHash: context.txHash,
    txBlockNumber: context.txBlockNumber,
  };
};

function resetToInitialState(context: DirectAllocationState) {
  const {
    setTokenApprovalStatus,
    setFundStatus,
    setIndexingStatus,
    setTxHash,
    setTxBlockNumber,
  } = context;

  setTokenApprovalStatus(initialDirectAllocationState.tokenApprovalStatus);
  setFundStatus(initialDirectAllocationState.fundStatus);
  setIndexingStatus(initialDirectAllocationState.indexingStatus);
  setTxHash(initialDirectAllocationState.txHash);
  setTxBlockNumber(initialDirectAllocationState.txBlockNumber);
}

async function _directAllocation({
  allo,
  context,
  poolId,
  fundAmount,
  payoutToken,
  recipient,
  nonce,
  requireTokenApproval,
}: SubmitFundParams) {
  resetToInitialState(context);

  try {
    const amount = ethers.utils
      .parseUnits(fundAmount.toString(), payoutToken.decimals)
      .toBigInt();

    const recipientAddress = getAddress(recipient);

    context.setTokenApprovalStatus(ProgressStatus.IN_PROGRESS);

    const result = await allo
      .directAllocation({
        poolId,
        tokenAddress: payoutToken.address,
        amount,
        recipient: recipientAddress,
        nonce,
        requireTokenApproval,
      })
      .on("tokenApprovalStatus", (tx) => {
        if (tx.type === "error") {
          context.setTokenApprovalStatus(ProgressStatus.IS_ERROR);
        } else {
          context.setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);
          context.setFundStatus(ProgressStatus.IN_PROGRESS);
        }
      })
      .on("transaction", (tx) => {
        if (tx.type === "error") {
          context.setFundStatus(ProgressStatus.IS_ERROR);
        }
      })
      .on("transactionStatus", (tx) => {
        if (tx.type === "error") {
          context.setFundStatus(ProgressStatus.IS_ERROR);
        } else {
          context.setFundStatus(ProgressStatus.IS_SUCCESS);
          context.setTxHash(tx.value.transactionHash);
          context.setTxBlockNumber(Number(tx.value.blockNumber));

          context.setIndexingStatus(ProgressStatus.IN_PROGRESS);
        }
      })
      .execute();

    if (result.type === "error") {
      throw result.error;
    }
  } catch (error) {
    datadogLogs.logger.error(`error: _directAllocation - ${error}`);
    console.error("Error while donating: ", error);
  }
}
