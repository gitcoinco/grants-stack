import {
  AppStatus,
  GrantApplication,
  ProgressStatus,
  Status,
} from "../../features/api/types";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { updateApplicationStatuses } from "../../features/api/application";
import { datadogLogs } from "@datadog/browser-logs";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { Signer } from "@ethersproject/abstract-signer";
import { useWallet } from "../../features/common/Auth";

export interface BulkUpdateGrantApplicationState {
  roundId: string;
  setRoundId: React.Dispatch<SetStateAction<string>>;
  applications: GrantApplication[];
  setApplications: React.Dispatch<SetStateAction<GrantApplication[]>>;
  selectedApplications: GrantApplication[];
  setSelectedApplications: React.Dispatch<SetStateAction<GrantApplication[]>>;
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
    selectedApplications: [],
    setSelectedApplications: () => {
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
  selectedApplications: GrantApplication[];
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
  const [selectedApplications, setSelectedApplications] = useState(
    initialBulkUpdateGrantApplicationState.selectedApplications
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
    selectedApplications,
    setSelectedApplications,
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
  selectedApplications: GrantApplication[];
}

function resetToInitialState(context: BulkUpdateGrantApplicationState) {
  const { setContractUpdatingStatus, setIndexingStatus } = context;

  setContractUpdatingStatus(
    initialBulkUpdateGrantApplicationState.contractUpdatingStatus
  );
  setIndexingStatus(initialBulkUpdateGrantApplicationState.indexingStatus);
}

function convertStatus(status: string) {
  switch (status) {
    case "PENDING":
      return 0;
    case "APPROVED":
      return 1;
    case "REJECTED":
      return 2;
    case "CANCELLED":
      return 3;
    default:
      throw new Error(`Unknown status ${status}`);
  }
}

function fetchStatuses(rowIndex: number, applications: GrantApplication[]) {
  const statuses: Status[] = [];

  const startApplicationIndex = rowIndex * 128;

  for (let columnIndex = 0; columnIndex < 128; columnIndex++) {
    const applicationIndex = startApplicationIndex + columnIndex;
    const application = applications.find(
      (app) => app.applicationIndex === applicationIndex
    );

    if (application !== undefined) {
      statuses.push({
        index: columnIndex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        status: convertStatus(application.status!),
      });
    }
  }
  return statuses;
}

function createFullRow(statuses: Status[]) {
  let fullRow = BigInt(0);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  for (const statusObj of statuses!) {
    const { index: columnIndex, status } = statusObj;

    if (columnIndex >= 0 && columnIndex < 128 && status >= 0 && status <= 3) {
      const statusBigInt = BigInt(status);
      const shiftedStatus = statusBigInt << BigInt(columnIndex * 2);
      fullRow |= shiftedStatus;
    } else {
      throw new Error("Invalid index or status value");
    }
  }
  return fullRow.toString();
}

async function _bulkUpdateGrantApplication({
  signer,
  context,
  roundId,
  applications,
  selectedApplications,
}: bulkUpdateGrantApplicationParams) {
  resetToInitialState(context);

  try {
    const updatedApplications = applications.map((application) => {
      let newStatus = application.status;

      const selectedApplication = selectedApplications.find(
        (selectedApplication) =>
          selectedApplication.applicationIndex === application.applicationIndex
      );

      if (selectedApplication) {
        newStatus = selectedApplication.status;
      }

      return { ...application, status: newStatus };
    });

    const rowsToUpdate = Array.from(
      new Set(
        selectedApplications.map((application) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return Math.floor(application.applicationIndex! / 128);
        })
      )
    );

    const statusRows: AppStatus[] = [];

    for (let i = 0; i < rowsToUpdate.length; i++) {
      const rowStatuses = fetchStatuses(rowsToUpdate[i], updatedApplications);
      statusRows.push({
        index: rowsToUpdate[i],
        statusRow: createFullRow(rowStatuses),
      });
    }

    const transactionBlockNumber = await updateContract({
      signer,
      roundId,
      statusRows,
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
    contractUpdatingStatus: context.contractUpdatingStatus,
    indexingStatus: context.indexingStatus,
  };
};

interface UpdateContractParams {
  signer: Signer;
  roundId: string;
  statusRows: AppStatus[];
  context: BulkUpdateGrantApplicationState;
}

const updateContract = async ({
  signer,
  roundId,
  statusRows,
  context,
}: UpdateContractParams): Promise<number> => {
  const { setContractUpdatingStatus } = context;

  try {
    setContractUpdatingStatus(ProgressStatus.IN_PROGRESS);

    const { transactionBlockNumber } = await updateApplicationStatuses(
      roundId,
      signer,
      statusRows
    );

    setContractUpdatingStatus(ProgressStatus.IS_SUCCESS);

    return transactionBlockNumber;
  } catch (error) {
    datadogLogs.logger.error(`error: updateApplicationStatuses - ${error}`);
    console.error(`updateApplicationStatuses roundId: ${roundId}`, error);
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
