import { datadogLogs } from "@datadog/browser-logs";
import { BytesLike, ethers, Signer } from "ethers";
import { createContext, ReactNode, SetStateAction, useContext, useState } from "react";
import { approveTokenOnContract, voteOnRoundContract } from "../features/api/application";
import { waitForSubgraphSyncTo } from "../features/api/subgraph";
import { FinalBallotDonation, PayoutToken, ProgressStatus } from "../features/api/types";
import { useWallet } from "../features/common/Auth";

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
  donations: FinalBallotDonation[],
  donationToken: PayoutToken,
  totalDonation: number
};

interface SubmitDonationParams {
  signer: Signer;
  context: QFDonationState;
  roundId: string;
  donations: FinalBallotDonation[],
  donationToken: PayoutToken,
  totalDonation: number
}

export const QFDonationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
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
  const { setTokenApprovalStatus, setVoteStatus, setIndexingStatus } =
    context;

  setTokenApprovalStatus(
    initialQFDonationState.tokenApprovalStatus
  );
  setVoteStatus(
    initialQFDonationState.voteStatus
  );
  setIndexingStatus(initialQFDonationState.indexingStatus);
}

async function _submitDonations({
  signer,
  context,
  roundId,
  donations,
  donationToken,
  totalDonation,
}: SubmitDonationParams) {

  resetToInitialState(context);

  try {

    // Token Approval
    await approveTokenForDonation(
      signer,
      donationToken,
      totalDonation,
      context
    );

    // Invoke Vote
    const transactionBlockNumber = await vote(
      signer,
      roundId,
      donationToken,
      donations,
      context,
    );

    // Wait for indexing on subgraph
    await waitForSubgraphToUpdate(signer, transactionBlockNumber, context);

  } catch (error) {
    datadogLogs.logger.error(`error: _submitDonations - ${error}`);
    console.error("Error while bulk submitting donations: ", error);
  }
}


export const useQFDonation = () => {
  const context = useContext<QFDonationState>(
    QFDonationContext
  );
  if (context === undefined) {
    throw new Error(
      "useQFDonation must be used within a QFDonationProvider"
    );
  }

  const { signer } = useWallet(); // THIS BREAKS

  const handleSubmitDonations = async ( params: QFDonationParams ) => {
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
  context: QFDonationState
): Promise<number> {
  const { setTokenApprovalStatus } = context;

  try {
    setTokenApprovalStatus(ProgressStatus.IN_PROGRESS);

    const votingStrategy = ethers.constants.AddressZero; // TODO wire in voting contract address

    // TODO: Skip if token is 0x0 as no approval is needed

    // TODO : convert amount to BigNumber for approval

    const { transactionBlockNumber } = await approveTokenOnContract(
      signerOrProvider,
      token.address,
      votingStrategy,
      amount // TODO: check if this should be BigNum
    );

    setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);

    return transactionBlockNumber;
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
  context: QFDonationState
): Promise<number> {
  const { setVoteStatus } = context;

  try {
    setVoteStatus(ProgressStatus.IN_PROGRESS);

    const encodedVotes = encodeQFVotes(token, donations);

    const { transactionBlockNumber } = await voteOnRoundContract(
      roundId,
      signerOrProvider,
      encodedVotes
    );

    setVoteStatus(ProgressStatus.IS_SUCCESS);
    return transactionBlockNumber;

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
  transactionBlockNumber: number,
  context: QFDonationState
) {
  const { setIndexingStatus } = context;

  try {
    datadogLogs.logger.error(
      `waitForSubgraphToUpdate: txnBlockNumber - ${transactionBlockNumber}`
    );

    setIndexingStatus(ProgressStatus.IN_PROGRESS);

    const chainId = await signerOrProvider.getChainId();

    await waitForSubgraphSyncTo(chainId, transactionBlockNumber);

    setIndexingStatus(ProgressStatus.IS_SUCCESS);
  } catch (error) {
    datadogLogs.logger.error(
      `error: waitForSubgraphToUpdate - ${error}. Data - ${transactionBlockNumber}`
    );
    setIndexingStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

function encodeQFVotes(donationToken: PayoutToken, donations: FinalBallotDonation[]) : BytesLike[] {
  let encodedVotes: BytesLike[] = [];

  donations.map(donation => {
    const vote = [
      donationToken.address,
      donation.amount, // TODO: update to BigNum
      "0x0" // TODO: update to project address
    ]

    encodedVotes.push(ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "address"],
      vote
    ));
  });

  return encodedVotes;
}