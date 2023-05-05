import { datadogLogs } from "@datadog/browser-logs";
import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { useSigner } from "wagmi";
import {
  approveTokenOnContract,
  voteOnRoundContract,
} from "../features/api/application";
import { waitForSubgraphSyncTo } from "../features/api/subgraph";
import {
  CartDonation,
  PayoutToken,
  ProgressStatus,
} from "../features/api/types";

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
};

export type QFDonationParams = {
  roundId: string;
  donations: CartDonation[];
  donationToken: PayoutToken;
  totalDonation: BigNumber;
  votingStrategy: string;
};

interface SubmitDonationParams {
  signer: Signer;
  context: QFDonationState;
  roundId: string;
  donations: CartDonation[];
  donationToken: PayoutToken;
  totalDonation: BigNumber;
  votingStrategy: string;
}

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

async function _submitDonations({
  signer,
  context,
  roundId,
  donations,
  donationToken,
  totalDonation,
  votingStrategy,
}: SubmitDonationParams) {
  resetToInitialState(context);

  try {
    // Token Approval
    await approveTokenForDonation(
      signer,
      donationToken,
      totalDonation,
      votingStrategy,
      context
    );

    // Invoke Vote
    await vote(
      signer,
      roundId,
      donationToken,
      donations,
      totalDonation,
      context
    );

    // Wait for indexing on subgraph
    await waitForSubgraphToUpdate(signer, context);
  } catch (error) {
    datadogLogs.logger.error(`error: _submitDonations - ${error}`);
    console.error("Error while bulk submitting donations: ", error);
  }
}

export const useQFDonation = () => {
  const context = useContext<QFDonationState>(QFDonationContext);
  if (context === undefined) {
    throw new Error("useQFDonation must be used within a QFDonationProvider");
  }

  const { data: signer } = useSigner();

  const handleSubmitDonations = async (params: QFDonationParams) => {
    return _submitDonations({
      ...params,
      signer: signer as Signer,
      context,
    });
  };

  return {
    submitDonations: handleSubmitDonations,
    tokenApprovalStatus: context.tokenApprovalStatus,
    voteStatus: context.voteStatus,
    indexingStatus: context.indexingStatus,
    txHash: context.txHash,
    txBlockNumber: context.txBlockNumber,
  };
};

async function approveTokenForDonation(
  signerOrProvider: Signer,
  token: PayoutToken,
  amount: BigNumber,
  votingStrategy: string,
  context: QFDonationState
): Promise<void> {
  const { setTokenApprovalStatus } = context;

  try {
    setTokenApprovalStatus(ProgressStatus.IN_PROGRESS);

    if (token.address == ethers.constants.AddressZero) {
      // avoid calling approval for native token
      setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);
      return;
    }

    await approveTokenOnContract(
      signerOrProvider,
      votingStrategy,
      token.address,
      amount
    );

    setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);
  } catch (error) {
    datadogLogs.logger.error(
      `error: approveTokenForDonation - ${error}. Data - ${amount} ${token.name}`
    );
    console.error(
      `approveTokenForDonation - amount ${amount} ${token.name}`,
      error
    );
    setTokenApprovalStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

async function vote(
  signerOrProvider: Signer,
  roundId: string,
  token: PayoutToken,
  donations: CartDonation[],
  totalDonation: BigNumber,
  context: QFDonationState
): Promise<void> {
  const { setVoteStatus, setTxHash, setTxBlockNumber } = context;

  try {
    setVoteStatus(ProgressStatus.IN_PROGRESS);

    const encodedVotes = encodeQFVotes(token, donations);

    const { txBlockNumber, txHash } = await voteOnRoundContract(
      roundId,
      signerOrProvider,
      encodedVotes,
      totalDonation
    );

    setVoteStatus(ProgressStatus.IS_SUCCESS);
    setTxHash(txHash);
    setTxBlockNumber(txBlockNumber);
  } catch (error) {
    datadogLogs.logger.error(
      `error: approveTokenForDonation - ${error}. Data - ${vote.toString()}`
    );
    console.error(
      `approveTokenForDonation - roundId ${roundId}, token ${token.name}`,
      error
    );
    setVoteStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

async function waitForSubgraphToUpdate(
  signerOrProvider: Signer,
  context: QFDonationState
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

function encodeQFVotes(
  donationToken: PayoutToken,
  donations: CartDonation[]
): BytesLike[] {
  const encodedVotes: BytesLike[] = [];

  donations.map((donation) => {
    const projectAddress = ethers.utils.getAddress(donation.projectAddress);

    const vote = [
      donationToken.address,
      donation.amount,
      projectAddress,
      donation.projectRegistryId,
      donation.applicationIndex,
    ];

    encodedVotes.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "address", "bytes32", "uint256"],
        vote
      )
    );
  });

  return encodedVotes;
}
