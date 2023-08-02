import { datadogLogs } from "@datadog/browser-logs";
import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { erc20ABI, useSigner } from "wagmi";
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

export const useQFDonation = () => {
  const context = useContext<QFDonationState>(QFDonationContext);
  if (context === undefined) {
    throw new Error("useQFDonation must be used within a QFDonationProvider");
  }

  const { data: signer } = useSigner();

  const handleSubmitDonations = async (params: QFDonationParams) => {
    return _submitDonations({
      ...params,
      signer: signer as JsonRpcSigner,
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

async function vote(
  signer: JsonRpcSigner,
  token: PayoutToken,
  donations: CartProject[],
  context: QFDonationState,
  deadline: number
): Promise<void> {
  const { setVoteStatus, setTxHash, setTxBlockNumber, setTokenApprovalStatus } =
    context;

  const totalDonation = donations
    .map((donation) => ethers.utils.parseUnits(donation.amount, token.decimal))
    .reduce((acc, amount) => acc.add(amount), BigNumber.from(0));

  let sig;
  let nonce;

  if (token.address !== zeroAddress) {
    try {
      setTokenApprovalStatus(ProgressStatus.IN_PROGRESS);
      const chainId = (await signer.getChainId()) as ChainId;
      const owner = await signer.getAddress();
      /* Get nonce and name from erc20 contract */
      const erc20Contract = new ethers.Contract(
        token.address,
        [
          "function nonces(address) public view returns (uint256)",
          "function name() public view returns (string)",
        ],
        signer
      );
      nonce = (await erc20Contract.nonces(owner)) as BigNumber;
      const tokenName = (await erc20Contract.name()) as string;
      if (/DAI/.test(tokenName)) {
        sig = await signPermitDai({
          signer,
          spender: MRC_CONTRACTS[chainId],
          chainId,
          deadline,
          contractAddress: token.address,
          erc20Name: tokenName,
          owner,
          nonce,
        });
      } else {
        debugger;
        sig = await signPermit2612({
          signer,
          value: totalDonation,
          spender: MRC_CONTRACTS[chainId],
          nonce,
          chainId,
          deadline,
          contractAddress: token.address,
          erc20Name: tokenName,
          owner,
        });
      }

      setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);
    } catch (e) {
      console.error(e);
      setTokenApprovalStatus(ProgressStatus.IS_ERROR);
    }

    if (!sig) {
      setTokenApprovalStatus(ProgressStatus.IS_ERROR);
      return;
    }
  }

  try {
    setTokenApprovalStatus(ProgressStatus.IS_SUCCESS);
    setVoteStatus(ProgressStatus.IN_PROGRESS);
    /* Group donations by round */
    const groupedDonations = _.groupBy(
      donations.map((d) => ({
        ...d,
        roundId: ethers.utils.getAddress(d.roundId),
      })),
      "roundId"
    );

    const groupedEncodedVotes: Record<string, BytesLike[]> = {};
    for (const roundId in groupedDonations) {
      groupedEncodedVotes[roundId] = encodeQFVotes(
        token,
        groupedDonations[roundId]
      );
    }

    const groupedAmounts: Record<string, BigNumber> = {};
    for (const roundId in groupedDonations) {
      groupedAmounts[roundId] = groupedDonations[roundId].reduce(
        (acc, donation) =>
          acc.add(ethers.utils.parseUnits(donation.amount, token.decimal)),
        BigNumber.from(0)
      );
    }

    const { txBlockNumber, txHash } = await voteUsingMRCContract(
      signer,
      token,
      groupedEncodedVotes,
      groupedAmounts,
      totalDonation,
      sig,
      deadline,
      nonce
    );

    setVoteStatus(ProgressStatus.IS_SUCCESS);
    setTxHash(txHash);
    setTxBlockNumber(txBlockNumber);
  } catch (error) {
    datadogLogs.logger.error(
      `error: vote - ${error}. Data - ${donations.toString()}`
    );
    console.error(
      `vote - roundIds ${Object.keys(donations.map((d) => d.roundId))}, token ${
        token.name
      }`,
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

function encodeQFVotes(
  donationToken: PayoutToken,
  donations: CartProject[]
): BytesLike[] {
  const encodedVotes: BytesLike[] = [];

  donations.map((donation) => {
    const projectAddress = ethers.utils.getAddress(donation.recipient);

    const vote = [
      donationToken.address,
      ethers.utils.parseUnits(donation.amount, donationToken.decimal),
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
