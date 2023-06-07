import {
  ProgressStatus,
  ProjectRequirements,
  Round,
  StorageProtocolID,
} from "../../features/api/types";
import React, {
  createContext,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { saveToIPFS } from "../../features/api/ipfs";
import { useWallet } from "../../features/common/Auth";
import { deployRoundContract } from "../../features/api/round";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { SchemaQuestion } from "../../features/api/utils";
import { datadogLogs } from "@datadog/browser-logs";
import { Signer } from "@ethersproject/abstract-signer";
import { deployQFVotingContract } from "../../features/api/votingStrategy/qfVotingStrategy";
import { deployMerklePayoutStrategyContract } from "../../features/api/payoutStrategy/merklePayoutStrategy";

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

export interface CreateRoundState {
  IPFSCurrentStatus: ProgressStatus;
  setIPFSCurrentStatus: SetStatusFn;
  votingContractDeploymentStatus: ProgressStatus;
  setVotingContractDeploymentStatus: SetStatusFn;
  payoutContractDeploymentStatus: ProgressStatus;
  setPayoutContractDeploymentStatus: SetStatusFn;
  roundContractDeploymentStatus: ProgressStatus;
  setRoundContractDeploymentStatus: SetStatusFn;
  indexingStatus: ProgressStatus;
  setIndexingStatus: SetStatusFn;
}

export type CreateRoundData = {
  roundMetadataWithProgramContractAddress: Round["roundMetadata"];
  applicationQuestions: {
    version: string;
    lastUpdatedOn: number;
    applicationSchema: {
      questions: SchemaQuestion[];
      requirements: ProjectRequirements;
    };
  };
  round: Round;
};

export const initialCreateRoundState: CreateRoundState = {
  IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
  setIPFSCurrentStatus: () => {
    /* provided in CreateRoundProvider */
  },
  votingContractDeploymentStatus: ProgressStatus.NOT_STARTED,
  setVotingContractDeploymentStatus: () => {
    /* provided in CreateRoundProvider */
  },
  payoutContractDeploymentStatus: ProgressStatus.NOT_STARTED,
  setPayoutContractDeploymentStatus: () => {
    /* provided in CreateRoundProvider */
  },
  roundContractDeploymentStatus: ProgressStatus.NOT_STARTED,
  setRoundContractDeploymentStatus: () => {
    /* provided in CreateRoundProvider */
  },
  indexingStatus: ProgressStatus.NOT_STARTED,
  setIndexingStatus: () => {
    /* provided in CreateRoundProvider */
  },
};

export const CreateRoundContext = createContext<CreateRoundState>(
  initialCreateRoundState
);

export const CreateRoundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [IPFSCurrentStatus, setIPFSCurrentStatus] = useState(
    initialCreateRoundState.IPFSCurrentStatus
  );
  const [votingContractDeploymentStatus, setVotingContractDeploymentStatus] =
    useState(initialCreateRoundState.votingContractDeploymentStatus);
  const [payoutContractDeploymentStatus, setPayoutContractDeploymentStatus] =
    useState(initialCreateRoundState.payoutContractDeploymentStatus);
  const [roundContractDeploymentStatus, setRoundContractDeploymentStatus] =
    useState(initialCreateRoundState.roundContractDeploymentStatus);
  const [indexingStatus, setIndexingStatus] = useState(
    initialCreateRoundState.indexingStatus
  );

  const providerProps: CreateRoundState = {
    IPFSCurrentStatus,
    setIPFSCurrentStatus,
    votingContractDeploymentStatus,
    setVotingContractDeploymentStatus,
    payoutContractDeploymentStatus,
    setPayoutContractDeploymentStatus,
    roundContractDeploymentStatus,
    setRoundContractDeploymentStatus,
    indexingStatus,
    setIndexingStatus,
  };

  return (
    <CreateRoundContext.Provider value={providerProps}>
      {children}
    </CreateRoundContext.Provider>
  );
};

interface _createRoundParams {
  context: CreateRoundState;
  signerOrProvider: Signer;
  createRoundData: CreateRoundData;
}

const _createRound = async ({
  context,
  signerOrProvider,
  createRoundData,
}: _createRoundParams) => {
  const {
    setIPFSCurrentStatus,
    setVotingContractDeploymentStatus,
    setPayoutContractDeploymentStatus,
    setRoundContractDeploymentStatus,
    setIndexingStatus,
  } = context;
  const {
    roundMetadataWithProgramContractAddress,
    applicationQuestions,
    round,
  } = createRoundData;
  try {
    datadogLogs.logger.info(`_createRound: ${round}`);

    if (roundMetadataWithProgramContractAddress && roundMetadataWithProgramContractAddress.eligibility) {
      roundMetadataWithProgramContractAddress.eligibility.requirements = roundMetadataWithProgramContractAddress.eligibility?.requirements.filter(
        obj => obj.requirement != ""
      );
    }

    const { roundMetadataIpfsHash, applicationSchemaIpfsHash } =
      await storeDocuments(
        setIPFSCurrentStatus,
        roundMetadataWithProgramContractAddress,
        applicationQuestions
      );

    const roundContractInputsWithPointers = {
      ...round,
      store: {
        protocol: StorageProtocolID.IPFS,
        pointer: roundMetadataIpfsHash,
      },
      applicationStore: {
        protocol: StorageProtocolID.IPFS,
        pointer: applicationSchemaIpfsHash,
      },
    };

    const votingContractAddress = await handleDeployVotingContract(
      setVotingContractDeploymentStatus,
      signerOrProvider
    );

    const payoutContractAddress = await handleDeployPayoutContract(
      setPayoutContractDeploymentStatus,
      signerOrProvider
    );

    const roundContractInputsWithContracts = {
      ...roundContractInputsWithPointers,
      votingStrategy: votingContractAddress,
      payoutStrategy: {
        id: payoutContractAddress,
        isReadyForPayout: false,
      },
    };

    const transactionBlockNumber = await handleDeployRoundContract(
      setRoundContractDeploymentStatus,
      roundContractInputsWithContracts,
      signerOrProvider
    );

    await waitForSubgraphToUpdate(
      setIndexingStatus,
      signerOrProvider,
      transactionBlockNumber
    );
  } catch (error) {
    datadogLogs.logger.error(
      `error: _createRound ${error}. Data : ${createRoundData}`
    );

    console.error("_createRound", error);
  }
};

export const useCreateRound = () => {
  const context = useContext(CreateRoundContext);
  if (context === undefined) {
    throw new Error("useCreateRound must be used within a CreateRoundProvider");
  }

  const {
    setIPFSCurrentStatus,
    setVotingContractDeploymentStatus,
    setPayoutContractDeploymentStatus,
    setRoundContractDeploymentStatus,
    setIndexingStatus,
  } = context;
  const { signer: walletSigner } = useWallet();

  const createRound = (createRoundData: CreateRoundData) => {
    resetToInitialState(
      setIPFSCurrentStatus,
      setVotingContractDeploymentStatus,
      setPayoutContractDeploymentStatus,
      setRoundContractDeploymentStatus,
      setIndexingStatus
    );

    return _createRound({
      context,
      signerOrProvider: walletSigner as Signer,
      createRoundData,
    });
  };

  return {
    createRound,
    IPFSCurrentStatus: context.IPFSCurrentStatus,
    votingContractDeploymentStatus: context.votingContractDeploymentStatus,
    payoutContractDeploymentStatus: context.payoutContractDeploymentStatus,
    roundContractDeploymentStatus: context.roundContractDeploymentStatus,
    indexingStatus: context.indexingStatus,
  };
};

function resetToInitialState(
  setStoringStatus: SetStatusFn,
  setVotingDeployingStatus: SetStatusFn,
  setPayoutDeployingStatus: SetStatusFn,
  setDeployingStatus: SetStatusFn,
  setIndexingStatus: SetStatusFn
): void {
  setStoringStatus(initialCreateRoundState.IPFSCurrentStatus);
  setVotingDeployingStatus(
    initialCreateRoundState.votingContractDeploymentStatus
  );
  setPayoutDeployingStatus(
    initialCreateRoundState.payoutContractDeploymentStatus
  );
  setDeployingStatus(initialCreateRoundState.roundContractDeploymentStatus);
  setIndexingStatus(initialCreateRoundState.indexingStatus);
}

async function storeDocuments(
  setStoringStatus: SetStatusFn,
  roundMetadataWithProgramContractAddress: CreateRoundData["roundMetadataWithProgramContractAddress"],
  applicationQuestions: CreateRoundData["applicationQuestions"]
) {
  try {
    setStoringStatus(ProgressStatus.IN_PROGRESS);

    const [roundMetadataIpfsHash, applicationSchemaIpfsHash] =
      await Promise.all([
        saveToIPFS({
          content: roundMetadataWithProgramContractAddress,
          metadata: {
            name: "round-metadata",
          },
        }),
        saveToIPFS({
          content: applicationQuestions,
          metadata: {
            name: "application-schema",
          },
        }),
      ]);

    setStoringStatus(ProgressStatus.IS_SUCCESS);

    return {
      roundMetadataIpfsHash,
      applicationSchemaIpfsHash,
    };
  } catch (error) {
    console.error("storeDocuments", error);

    setStoringStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

async function handleDeployVotingContract(
  setDeploymentStatus: SetStatusFn,
  signerOrProvider: Signer
): Promise<string> {
  try {
    setDeploymentStatus(ProgressStatus.IN_PROGRESS);
    const { votingContractAddress } = await deployQFVotingContract(
      signerOrProvider
    );

    setDeploymentStatus(ProgressStatus.IS_SUCCESS);
    return votingContractAddress;
  } catch (error) {
    console.error("handleDeployVotingContract", error);
    setDeploymentStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

async function handleDeployPayoutContract(
  setDeploymentStatus: SetStatusFn,
  signerOrProvider: Signer
): Promise<string> {
  try {
    setDeploymentStatus(ProgressStatus.IN_PROGRESS);
    const { payoutContractAddress } = await deployMerklePayoutStrategyContract(
      signerOrProvider
    );

    setDeploymentStatus(ProgressStatus.IS_SUCCESS);
    return payoutContractAddress;
  } catch (error) {
    console.error("handleDeployPayoutContract", error);
    setDeploymentStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

async function handleDeployRoundContract(
  setDeploymentStatus: SetStatusFn,
  round: Round,
  signerOrProvider: Signer
): Promise<number> {
  try {
    setDeploymentStatus(ProgressStatus.IN_PROGRESS);
    const { transactionBlockNumber } = await deployRoundContract(
      round,
      signerOrProvider
    );

    setDeploymentStatus(ProgressStatus.IS_SUCCESS);

    return transactionBlockNumber;
  } catch (error) {
    console.error("handleDeployRoundContract", error);
    setDeploymentStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}

async function waitForSubgraphToUpdate(
  setIndexingStatus: SetStatusFn,
  signerOrProvider: Signer,
  transactionBlockNumber: number
) {
  try {
    setIndexingStatus(ProgressStatus.IN_PROGRESS);

    const chainId = await signerOrProvider.getChainId();
    await waitForSubgraphSyncTo(chainId, transactionBlockNumber);

    setIndexingStatus(ProgressStatus.IS_SUCCESS);
  } catch (error) {
    console.error("waitForSubgraphToUpdate", error);
    setIndexingStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}
