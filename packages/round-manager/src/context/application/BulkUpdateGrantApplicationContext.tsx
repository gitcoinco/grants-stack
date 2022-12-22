import { GrantApplication, ProgressStatus } from "../../features/api/types";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import {
  updateApplicationList,
  updateRoundContract,
} from "../../features/api/application";
import { datadogLogs } from "@datadog/browser-logs";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { Signer } from "@ethersproject/abstract-signer";
import { useWallet } from "../../features/common/Auth";

export interface BulkUpdateGrantApplicationState {
  roundId: string;
  setRoundId: React.Dispatch<SetStateAction<string>>;
  applications: GrantApplication[];
  setApplications: React.Dispatch<SetStateAction<GrantApplication[]>>;
  IPFSCurrentStatus: ProgressStatus;
  setIPFSCurrentStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
  contractUpdatingStatus: ProgressStatus;
  setContractUpdatingStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
  indexingStatus: ProgressStatus;
  setIndexingStatus: React.Dispatch<SetStateAction<ProgressStatus>>;
}

export const initialBulkUpdateGrantApplicationState: BulkUpdateGrantApplicationState =
  {
    roundId: "",
    setRoundId: () => {
      /**/
    },
    applications: [],
    setApplications: () => {
      /**/
    },
    IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
    setIPFSCurrentStatus: () => {
      /**/
    },
    contractUpdatingStatus: ProgressStatus.NOT_STARTED,
    setContractUpdatingStatus: () => {
      /**/
    },
    indexingStatus: ProgressStatus.NOT_STARTED,
    setIndexingStatus: () => {
      /**/
    },
  };

export type BulkUpdateGrantApplicationParams = {
  roundId: string;
  applications: GrantApplication[];
};

export const BulkUpdateGrantApplicationContext =
  createContext<BulkUpdateGrantApplicationState>(
    initialBulkUpdateGrantApplicationState
  );

export const BulkUpdateGrantApplicationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [roundId, setRoundId] = useState(
    initialBulkUpdateGrantApplicationState.roundId
  );
  const [applications, setApplications] = useState(
    initialBulkUpdateGrantApplicationState.applications
  );
  const [IPFSCurrentStatus, setIPFSCurrentStatus] = useState(
    initialBulkUpdateGrantApplicationState.IPFSCurrentStatus
  );
  const [contractUpdatingStatus, setContractUpdatingStatus] = useState(
    initialBulkUpdateGrantApplicationState.contractUpdatingStatus
  );

  const [indexingStatus, setIndexingStatus] = useState(
    initialBulkUpdateGrantApplicationState.indexingStatus
  );

  const providerProps: BulkUpdateGrantApplicationState = {
    roundId,
    setRoundId,
    applications,
    setApplications,
    IPFSCurrentStatus,
    setIPFSCurrentStatus,
    contractUpdatingStatus,
    setContractUpdatingStatus,
    indexingStatus,
    setIndexingStatus,
  };

  return (
    <BulkUpdateGrantApplicationContext.Provider value={providerProps}>
      {children}
    </BulkUpdateGrantApplicationContext.Provider>
  );
};

interface bulkUpdateGrantApplicationParams {
  signer: Signer;
  context: BulkUpdateGrantApplicationState;
  roundId: string;
  applications: GrantApplication[];
}

function resetToInitialState(context: BulkUpdateGrantApplicationState) {
  const { setIPFSCurrentStatus, setContractUpdatingStatus, setIndexingStatus } =
    context;

  setIPFSCurrentStatus(
    initialBulkUpdateGrantApplicationState.IPFSCurrentStatus
  );
  setContractUpdatingStatus(
    initialBulkUpdateGrantApplicationState.contractUpdatingStatus
  );
  setIndexingStatus(initialBulkUpdateGrantApplicationState.indexingStatus);
}

async function _bulkUpdateGrantApplication({
  signer,
  context,
  roundId,
  applications,
}: bulkUpdateGrantApplicationParams) {
  resetToInitialState(context);

  try {
    const newProjectsMetaPtr = await storeDocument({
      signer,
      roundId,
      applications,
      context,
    });
    const transactionBlockNumber = await updateContract({
      signer,
      roundId,
      newProjectsMetaPtr,
      context,
    });

    await waitForSubgraphToUpdate(signer, transactionBlockNumber, context);
  } catch (error) {
    datadogLogs.logger.error(`error: _bulkUpdateGrantApplication - ${error}`);
    console.error("_bulkUpdateGrantApplication: ", error);
  }
}

export const useBulkUpdateGrantApplications = () => {
  const context = useContext<BulkUpdateGrantApplicationState>(
    BulkUpdateGrantApplicationContext
  );
  if (context === undefined) {
    throw new Error(
      "useBulkUpdateGrantApplication must be used within a BulkUpdateGrantApplicationProvider"
    );
  }

  const { signer } = useWallet();

  const handleBulkUpdateGrantApplications = async (
    params: BulkUpdateGrantApplicationParams
  ) => {
    return _bulkUpdateGrantApplication({
      ...params,
      signer: signer as Signer,
      context,
    });
  };

  return {
    bulkUpdateGrantApplications: handleBulkUpdateGrantApplications,
    IPFSCurrentStatus: context.IPFSCurrentStatus,
    contractUpdatingStatus: context.contractUpdatingStatus,
    indexingStatus: context.indexingStatus,
  };
};

interface StoreDocumentParams {
  signer: Signer;
  roundId: string;
  applications: GrantApplication[];
  context: BulkUpdateGrantApplicationState;
}

const storeDocument = async ({
  signer,
  roundId,
  applications,
  context,
}: StoreDocumentParams): Promise<string> => {
  const { setIPFSCurrentStatus } = context;
  try {
    setIPFSCurrentStatus(ProgressStatus.IN_PROGRESS);

    const chainId = await signer.getChainId();
    const ipfsHash = await updateApplicationList(
      applications,
      roundId,
      chainId
    );

    setIPFSCurrentStatus(ProgressStatus.IS_SUCCESS);

    return ipfsHash;
  } catch (error) {
    datadogLogs.logger.error(`error: storeDocument - ${error}`);
    console.error("storeDocument", error)
    setIPFSCurrentStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
};

interface UpdateContractParams {
  signer: Signer;
  roundId: string;
  newProjectsMetaPtr: string;
  context: BulkUpdateGrantApplicationState;
}

const updateContract = async ({
  signer,
  roundId,
  newProjectsMetaPtr,
  context,
}: UpdateContractParams): Promise<number> => {
  const { setContractUpdatingStatus } = context;

  try {
    setContractUpdatingStatus(ProgressStatus.IN_PROGRESS);

    const { transactionBlockNumber } = await updateRoundContract(
      roundId,
      signer,
      newProjectsMetaPtr
    );

    setContractUpdatingStatus(ProgressStatus.IS_SUCCESS);

    return transactionBlockNumber;
  } catch (error) {
    datadogLogs.logger.error(`error: updateContract - ${error}`);
    console.error(`updateContract roundId: ${roundId}`, error)
    setContractUpdatingStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
};

async function waitForSubgraphToUpdate(
  signerOrProvider: Signer,
  transactionBlockNumber: number,
  context: BulkUpdateGrantApplicationState
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
    console.error("waitForSubgraphToUpdate", error);
    setIndexingStatus(ProgressStatus.IS_ERROR);
    throw error;
  }
}
