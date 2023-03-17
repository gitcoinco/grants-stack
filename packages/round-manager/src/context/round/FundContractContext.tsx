import { datadogLogs } from "@datadog/browser-logs";
import { ethers, Signer } from "ethers";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useReducer,
  useState,
} from "react";
import { useSigner } from "wagmi";
import {
  approveTokenOnContract,
  fundRoundContract,
} from "../../features/api/application";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";

import { ProgressStatus } from "../../features/api/types";
import { PayoutToken } from "../../features/api/utils";

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
  roundId: string;
  userAddress: string;
  fundAmount: number;
  payoutToken: PayoutToken;
};

interface SubmitFundParams {
  signer: Signer;
  context: FundContractState;
  roundId: string;
  userAddress: string;
  payoutToken: PayoutToken;
  fundAmount: number;
}

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
  const context = useContext(FundContractContext);
  if (context === undefined) {
    throw new Error(
      "useFundContract must be used within a FundContractProvider"
    );
  }

  const { data: signer } = useSigner();

  const handleFundContract = async (params: FundContractParams) => {
    return _fundContract({
      ...params,
      signer: signer as Signer,
      context,
    });

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
    signer,
    context,
    roundId,
    userAddress,
    fundAmount,
    payoutToken,
  }: SubmitFundParams) {
    resetToInitialState(context);

    try {
      // Token Approval
      await approveTokenForFunding(
        signer,
        roundId,
        payoutToken,
        fundAmount,
        context
      );

      // Invoke fund
      await fund(
        signer,
        roundId,
        userAddress,
        payoutToken,
        fundAmount,
        context
      );

      // Wait for indexing on subgraph
      await waitForSubgraphToUpdate(signer, context);
    } catch (error) {
      datadogLogs.logger.error(`error: _submitDonations - ${error}`);
      console.error("Error while bulk submitting donations: ", error);
    }
  }

  async function approveTokenForFunding(
    signerOrProvider: Signer,
    roundId: string,
    token: PayoutToken,
    amount: number,
    context: FundContractState
  ): Promise<void> {
    const { setTokenApprovalStatus } = context;

    try {
      setTokenApprovalStatus(ProgressStatus.IN_PROGRESS);

      if (token.address == ethers.constants.AddressZero) {
        // avoid calling approval for native token
        setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);
        return;
      }

      const amountInUnits = ethers.utils.parseUnits(
        amount.toString(),
        token.decimal
      );

      await approveTokenOnContract(
        signerOrProvider,
        roundId,
        token.address,
        amountInUnits
      );

      setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);
    } catch (error) {
      datadogLogs.logger.error(
        `error: approveTokenForFunding - ${error}. Data - ${amount} ${token.name}`
      );
      console.error(
        `approveTokenForFunding - amount ${amount} ${token.name}`,
        error
      );
      setTokenApprovalStatus(ProgressStatus.IS_ERROR);
      throw error;
    }
  }

  async function fund(
    signerOrProvider: Signer,
    roundId: string,
    userAddress: string,
    token: PayoutToken,
    fundAmount: number,
    context: FundContractState
  ): Promise<void> {
    const { setFundStatus, setTxHash, setTxBlockNumber } = context;

    try {
      setFundStatus(ProgressStatus.IN_PROGRESS);

      const { txBlockNumber, txHash } = await fundRoundContract(
        roundId,
        userAddress,
        signerOrProvider,
        token,
        fundAmount
      );

      setFundStatus(ProgressStatus.IS_SUCCESS);
      setTxHash(txHash);
      setTxBlockNumber(txBlockNumber);
    } catch (error) {
      datadogLogs.logger.error(
        `error: fundRoundContract - ${error}. Data - ${fund.toString()}`
      );
      console.error(
        `fundRoundContract - roundId ${roundId}, token ${token.name}`,
        error
      );
      setFundStatus(ProgressStatus.IS_ERROR);
      throw error;
    }
  }

  async function waitForSubgraphToUpdate(
    signerOrProvider: Signer,
    context: FundContractState
  ) {
    const { setIndexingStatus, txBlockNumber } = context;

    try {
      datadogLogs.logger.error(
        `waitForSubgraphToUpdate: txnBlockNumber - ${txBlockNumber}`
      );

      setIndexingStatus(ProgressStatus.IN_PROGRESS);

      const chainId = await signerOrProvider?.getChainId();

      await waitForSubgraphSyncTo(chainId, txBlockNumber);

      setIndexingStatus(ProgressStatus.IS_SUCCESS);
    } catch (error) {
      datadogLogs.logger.error(
        `error: waitForSubgraphToUpdate - ${error}. Data - ${txBlockNumber}`
      );

      console.error(
        `waitForSubgraphToUpdate. TxnBlockNumber - ${txBlockNumber}`,
        error
      );

      setIndexingStatus(ProgressStatus.IS_ERROR);
      throw error;
    }
  }
};
