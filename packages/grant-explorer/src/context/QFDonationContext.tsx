import { datadogLogs } from "@datadog/browser-logs";
import { BytesLike, ethers, Signer } from "ethers";
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
  FinalBallotDonation,
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
};

export type QFDonationParams = {
  roundId: string;
  donations: FinalBallotDonation[];
  donationToken: PayoutToken;
  totalDonation: number;
  votingStrategy: string;
};

interface SubmitDonationParams {
  signer: Signer;
  context: QFDonationState;
  roundId: string;
  donations: FinalBallotDonation[];
  donationToken: PayoutToken;
  totalDonation: number;
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

  const providerProps: QFDonationState = {
    tokenApprovalStatus,
    setTokenApprovalStatus,
    voteStatus,
    setVoteStatus,
    indexingStatus,
    setIndexingStatus,
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
  const { setTokenApprovalStatus, setVoteStatus, setIndexingStatus } = context;

  setTokenApprovalStatus(initialQFDonationState.tokenApprovalStatus);
  setVoteStatus(initialQFDonationState.voteStatus);
  setIndexingStatus(initialQFDonationState.indexingStatus);
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
    const { txBlockNumber, txHash} = await vote(
      signer,
      roundId,
      donationToken,
      donations,
      totalDonation,
      context
    );

    // Wait for indexing on subgraph
    await waitForSubgraphToUpdate(signer, txBlockNumber, context);

    return txHash;
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
  };
};

async function approveTokenForDonation(
  signerOrProvider: Signer,
  token: PayoutToken,
  amount: number,
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

    const amountInUnits = ethers.utils.parseUnits(
      amount.toString(),
      token.decimal
    );

    await approveTokenOnContract(
      signerOrProvider,
      votingStrategy,
      token.address,
      amountInUnits
    );

    setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);
  } catch (error) {
    datadogLogs.logger.error(
      `error: approveTokenForDonation - ${error}. Data - ${amount} ${token.name}`
    );
    setTokenApprovalStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

async function vote(
  signerOrProvider: Signer,
  roundId: string,
  token: PayoutToken,
  donations: FinalBallotDonation[],
  totalDonation: number,
  context: QFDonationState
): Promise<{ txBlockNumber: number, txHash: string }> {
  const { setVoteStatus } = context;

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
    return {
      txBlockNumber: txBlockNumber,
      txHash: txHash
    };
  } catch (error) {
    datadogLogs.logger.error(
      `error: approveTokenForDonation - ${error}. Data - ${vote.toString()}`
    );
    setVoteStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

async function waitForSubgraphToUpdate(
  signerOrProvider: Signer,
  txBlockNumber: number,
  context: QFDonationState
) {
  const { setIndexingStatus } = context;

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
    setIndexingStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

function encodeQFVotes(
  donationToken: PayoutToken,
  donations: FinalBallotDonation[]
): BytesLike[] {
  const encodedVotes: BytesLike[] = [];

  donations.map((donation) => {
    const amountInUnits = ethers.utils.parseUnits(
      donation.amount.toString(),
      donationToken.decimal
    );
    let projectAddress = donation.projectAddress;
    projectAddress = ethers.utils.getAddress(projectAddress);

    const vote = [donationToken.address, amountInUnits, projectAddress];

    encodedVotes.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "address"],
        vote
      )
    );
  });

  return encodedVotes;
}
