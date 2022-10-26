import {
  ProgressStatus,
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

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

export interface CreateRoundState {
  IPFSCurrentStatus: ProgressStatus;
  setIPFSCurrentStatus: SetStatusFn;
  contractDeploymentStatus: ProgressStatus;
  setContractDeploymentStatus: SetStatusFn;
  indexingStatus: ProgressStatus;
  setIndexingStatus: SetStatusFn;
}

export type CreateRoundData = {
  roundMetadataWithProgramContractAddress: Round["roundMetadata"];
  applicationQuestions: {
    lastUpdatedOn: number;
    applicationSchema: SchemaQuestion[];
  };
  round: Round;
};

export const initialCreateRoundState: CreateRoundState = {
  IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
  setIPFSCurrentStatus: () => {
    /* provided in CreateRoundProvider */
  },
  contractDeploymentStatus: ProgressStatus.NOT_STARTED,
  setContractDeploymentStatus: () => {
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
  const [contractDeploymentStatus, setContractDeploymentStatus] = useState(
    initialCreateRoundState.contractDeploymentStatus
  );
  const [indexingStatus, setIndexingStatus] = useState(
    initialCreateRoundState.indexingStatus
  );

  const providerProps: CreateRoundState = {
    IPFSCurrentStatus,
    setIPFSCurrentStatus,
    contractDeploymentStatus,
    setContractDeploymentStatus,
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
    setContractDeploymentStatus,
    setIndexingStatus,
  } = context;
  const {
    roundMetadataWithProgramContractAddress,
    applicationQuestions,
    round,
  } = createRoundData;
  try {
    datadogLogs.logger.info(`_createRound: ${round}`);

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

    // TODO - deploy QF voting contract, add voting contract address to round deploy params
    // TODO - use hardcoded dummy contract 0xAD8E33940a0275651FC4a3a5Ab26a53067e5E50A as the payout contract address
    const roundContractInputsWithContracts = {
      ...roundContractInputsWithPointers,
      votingStrategy: "0xAD8E33940a0275651FC4a3a5Ab26a53067e5E50A", // TODO replace with real voting contract
      payoutStrategy: "0xAD8E33940a0275651FC4a3a5Ab26a53067e5E50A", // TODO replace with real payout contract when implemented
    };

    const transactionBlockNumber = await deployContract(
      setContractDeploymentStatus,
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

    console.error("Error while creating round: ", error);
  }
};

export const useCreateRound = () => {
  const context = useContext(CreateRoundContext);
  if (context === undefined) {
    throw new Error("useCreateRound must be used within a CreateRoundProvider");
  }

  const {
    setIPFSCurrentStatus,
    setContractDeploymentStatus,
    setIndexingStatus,
  } = context;
  const { signer: walletSigner } = useWallet();

  const createRound = (createRoundData: CreateRoundData) => {
    resetToInitialState(
      setIPFSCurrentStatus,
      setContractDeploymentStatus,
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
    contractDeploymentStatus: context.contractDeploymentStatus,
    indexingStatus: context.indexingStatus,
  };
};

function resetToInitialState(
  setStoringStatus: SetStatusFn,
  setDeployingStatus: SetStatusFn,
  setIndexingStatus: SetStatusFn
): void {
  setStoringStatus(initialCreateRoundState.IPFSCurrentStatus);
  setDeployingStatus(initialCreateRoundState.contractDeploymentStatus);
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
  } catch (e) {
    setStoringStatus(ProgressStatus.IS_ERROR);
    throw e;
  }
}

async function deployContract(
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
  } catch (e) {
    setDeploymentStatus(ProgressStatus.IS_ERROR);

    throw e;
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
  } catch (e) {
    setIndexingStatus(ProgressStatus.IS_ERROR);
    throw e;
  }
}
