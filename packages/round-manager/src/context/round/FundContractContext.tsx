import { datadogLogs } from "@datadog/browser-logs";
import { ethers } from "ethers";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

import { ProgressStatus } from "../../features/api/types";

import { PayoutToken } from "../../features/api/payoutTokens";
import { Allo } from "common";

export interface FundContractState {
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

export type FundContractParams = {
  allo: Allo;
  roundId: string;
  fundAmount: number;
  payoutToken: PayoutToken;
};

type SubmitFundParams = FundContractParams & {
  context: FundContractState;
};

export const FundContractProvider = ({ children }: { children: ReactNode }) => {
  const [tokenApprovalStatus, setTokenApprovalStatus] = useState(
    initialFundContractState.tokenApprovalStatus
  );
  const [fundStatus, setFundStatus] = useState(
    initialFundContractState.fundStatus
  );
  const [indexingStatus, setIndexingStatus] = useState(
    initialFundContractState.indexingStatus
  );
  const [txHash, setTxHash] = useState(initialFundContractState.txHash);
  const [txBlockNumber, setTxBlockNumber] = useState(
    initialFundContractState.txBlockNumber
  );

  const providerProps: FundContractState = {
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
    <FundContractContext.Provider value={providerProps}>
      {children}
    </FundContractContext.Provider>
  );
};

export const initialFundContractState: FundContractState = {
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

export const FundContractContext = createContext<FundContractState>(
  initialFundContractState
);

export const useFundContract = () => {
  const context = useContext<FundContractState>(FundContractContext);
  if (context === undefined) {
    throw new Error(
      "useFundContract must be used within a FundContractProvider"
    );
  }

  const handleFundContract = async (params: FundContractParams) => {
    return _fundContract({
      ...params,
      context,
    });
  };
  return {
    fundContract: handleFundContract,
    tokenApprovalStatus: context.tokenApprovalStatus,
    fundStatus: context.fundStatus,
    indexingStatus: context.indexingStatus,
    txHash: context.txHash,
    txBlockNumber: context.txBlockNumber,
  };
};

function resetToInitialState(context: FundContractState) {
  const {
    setTokenApprovalStatus,
    setFundStatus,
    setIndexingStatus,
    setTxHash,
    setTxBlockNumber,
  } = context;

  setTokenApprovalStatus(initialFundContractState.tokenApprovalStatus);
  setFundStatus(initialFundContractState.fundStatus);
  setIndexingStatus(initialFundContractState.indexingStatus);
  setTxHash(initialFundContractState.txHash);
  setTxBlockNumber(initialFundContractState.txBlockNumber);
}

async function _fundContract({
  allo,
  context,
  roundId,
  fundAmount,
  payoutToken,
}: SubmitFundParams) {
  resetToInitialState(context);

  try {
    const amount = ethers.utils
      .parseUnits(fundAmount.toString(), payoutToken.decimal)
      .toBigInt();

    context.setTokenApprovalStatus(ProgressStatus.IN_PROGRESS);

    const result = await allo
      .fundRound({
        roundId,
        tokenAddress: payoutToken.address,
        amount,
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
    datadogLogs.logger.error(`error: _fundContract - ${error}`);
    console.error("Error while funding contract: ", error);
  }
}
