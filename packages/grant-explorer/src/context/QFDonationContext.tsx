import { datadogLogs } from "@datadog/browser-logs";
import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import {
  PermitSignature,
  signPermit2612,
  signPermitDai,
  voteUsingMRCContract,
} from "../features/api/voting";
import { waitForSubgraphSyncTo } from "../features/api/subgraph";
import {
  CartProject,
  PayoutToken,
  ProgressStatus,
} from "../features/api/types";
import _ from "lodash";
import { MRC_CONTRACTS } from "../features/api/contracts";
import { ChainId } from "common";
import { JsonRpcSigner } from "@ethersproject/providers";
import { zeroAddress } from "viem";

export interface QFDonationState {
  tokenApprovalStatus: ProgressStatus;
  setTokenApprovalStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
  voteStatus: ProgressStatus;
  setVoteStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
  indexingStatus: ProgressStatus;
  setIndexingStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
  txHash: string;
  setTxHash: React.Dispatch<SetStateAction<string>>;
  txBlockNumber: number;
  setTxBlockNumber: React.Dispatch<SetStateAction<number>>;
  permit: PermitSignature | undefined;
  setPermit: React.Dispatch<React.SetStateAction<PermitSignature | undefined>>;
}

export const initialQFDonationState: QFDonationState = {
  tokenApprovalStatus: ProgressStatus.NOT_STARTED,
  setTokenApprovalStatus: () => {
    /**/
  },
  voteStatus: ProgressStatus.NOT_STARTED,
  setVoteStatus: () => {
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
  permit: undefined,
  setPermit: () => {
    /**/
  },
};

export type QFDonationParams = {
  donations: CartProject[];
  donationToken: PayoutToken;
  totalDonation: BigNumber;
  signer: JsonRpcSigner;
  roundEndTime: number;
};

export const QFDonationProvider = ({ children }: { children: ReactNode }) => {
  const [tokenApprovalStatus, setTokenApprovalStatus] = useState(
    initialQFDonationState.tokenApprovalStatus
  );
  const [voteStatus, setVoteStatus] = useState(
    initialQFDonationState.voteStatus
  );
  const [indexingStatus, setIndexingStatus] = useState(
    initialQFDonationState.indexingStatus
  );
  const [txHash, setTxHash] = useState(initialQFDonationState.txHash);
  const [txBlockNumber, setTxBlockNumber] = useState(
    initialQFDonationState.txBlockNumber
  );
  const [permit, setPermit] = useState<PermitSignature | undefined>();

  const providerProps: QFDonationState = {
    tokenApprovalStatus,
    setTokenApprovalStatus,
    voteStatus,
    setVoteStatus,
    indexingStatus,
    setIndexingStatus,
    txHash,
    setTxHash,
    txBlockNumber,
    setTxBlockNumber,
    permit,
    setPermit,
  };

  return (
    <QFDonationContext.Provider value={providerProps}>
      {children}
    </QFDonationContext.Provider>
  );
};

export const QFDonationContext = createContext<QFDonationState>(
  initialQFDonationState
);

function resetToInitialState(context: QFDonationState) {
  const {
    setTokenApprovalStatus,
    setVoteStatus,
    setIndexingStatus,
    setTxHash,
    setTxBlockNumber,
  } = context;

  setTokenApprovalStatus(initialQFDonationState.tokenApprovalStatus);
  setVoteStatus(initialQFDonationState.voteStatus);
  setIndexingStatus(initialQFDonationState.indexingStatus);
  setTxHash(initialQFDonationState.txHash);
  setTxBlockNumber(initialQFDonationState.txBlockNumber);
}

type SubmitDonationParams = QFDonationParams & {
  signer: JsonRpcSigner;
  context: QFDonationState;
};

async function _submitDonations({
  signer,
  context,
  donations,
  donationToken,
  roundEndTime,
}: SubmitDonationParams) {
  resetToInitialState(context);

  try {
    // Invoke Vote
    await vote(signer, donationToken, donations, context, roundEndTime);

    // Wait for indexing on subgraph
    await waitForSubgraphToUpdate(signer, context);
  } catch (error) {
    datadogLogs.logger.error(`error: _submitDonations - ${error}`);
    console.error("Error while bulk submitting donations: ", error);
  }
}

const poll = async function (fn: any, fnCondition: any, ms = 100) {
  let result = await fn();
  while (fnCondition(result)) {
    await wait(ms);
    result = await fn();
  }
  return result;
};

const wait = function (ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const useQFDonation = () => {
  const context = useContext<QFDonationState>(QFDonationContext);
  if (context === undefined) {
    throw new Error("useQFDonation must be used within a QFDonationProvider");
  }

  const handleSubmitDonations = async (params: QFDonationParams) => {
    return _submitDonations({
      ...params,
      signer: params.signer,
      context,
    });
  };

  return {
    submitDonations: handleSubmitDonations,
    setTokenApprovalStatus: context.setTokenApprovalStatus,
    setVoteStatus: context.setVoteStatus,
    tokenApprovalStatus: context.tokenApprovalStatus,
    voteStatus: context.voteStatus,
    indexingStatus: context.indexingStatus,
    txHash: context.txHash,
    txBlockNumber: context.txBlockNumber,
  };
};

async function waitForSubgraphToUpdate(
  signerOrProvider: Signer,
  context: QFDonationState
) {
  const { setIndexingStatus, txBlockNumber } = context;

  try {
    datadogLogs.logger.info(
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
