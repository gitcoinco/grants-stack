import {
  AppStatus,
  GrantApplication,
  ProgressStatus,
  StatusForDirectPayout,
} from "../../features/api/types";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import {
  updateApplicationStatuses,
  updatePayoutApplicationStatuses,
} from "../../features/api/application";
import { datadogLogs } from "@datadog/browser-logs";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { Signer } from "@ethersproject/abstract-signer";
import { useWallet } from "../../features/common/Auth";
import { Allo, RoundStrategyType } from "common";
import { Address } from "viem";

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
  signer: Signer;
  context: BulkUpdateGrantApplicationState;
  roundId: string;
  roundStrategy: RoundStrategyType;
  roundStrategyAddress: string;
  applications: GrantApplication[];
  selectedApplications: GrantApplication[];
  allo: Allo;
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

function resetToInitialState(context: BulkUpdateGrantApplicationState) {
  const { setContractUpdatingStatus, setIndexingStatus } = context;

  setContractUpdatingStatus(
    initialBulkUpdateGrantApplicationState.contractUpdatingStatus
  );
  setIndexingStatus(initialBulkUpdateGrantApplicationState.indexingStatus);
}

function fetchStatusesForPayoutStrategy(
  rowIndex: number,
  applications: GrantApplication[]
) {
  const statuses: StatusForDirectPayout[] = [];

  const startApplicationIndex = rowIndex * 256;

  for (let columnIndex = 0; columnIndex < 256; columnIndex++) {
    const applicationIndex = startApplicationIndex + columnIndex;
    const application = applications.find(
      (app) => app.applicationIndex === applicationIndex
    );

    if (application !== undefined) {
      statuses.push({
        index: columnIndex,
        status: Boolean(application.inReview),
      });
    }
  }
  return statuses;
}

function createFullRowForPayoutStrategy(statuses: StatusForDirectPayout[]) {
  let fullRow = BigInt(0);
  for (const statusObj of statuses) {
    const { index: columnIndex, status } = statusObj;

    if (columnIndex >= 0 && columnIndex < 256 && typeof status === "boolean") {
      const statusBigInt = BigInt(status ? 1 : 0);
      const shiftedStatus = statusBigInt << BigInt(columnIndex);
      1;
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
  roundStrategyAddress,
  applications,
  selectedApplications,
  allo,
}: BulkUpdateGrantApplicationParams) {
  resetToInitialState(context);
  try {
    const containsInReview = selectedApplications.some((a) => a.inReview);

    if (!containsInReview) {
      context.setContractUpdatingStatus(ProgressStatus.IN_PROGRESS);

      const result = await allo
        .bulkUpdateApplicationStatus({
          roundId,
          applicationsToUpdate: selectedApplications.map((a) => ({
            index: a.applicationIndex,
            status: a.status,
          })),
          currentApplications: applications.map((a) => ({
            index: a.applicationIndex,
            status: a.status,
          })),
          // FIXME: use getAddress when tests stop failing because of it
          strategyAddress: roundStrategyAddress as Address,
        })
        .on("transactionStatus", (tx) => {
          if (tx.type === "success") {
            context.setContractUpdatingStatus(ProgressStatus.IS_SUCCESS);
            context.setIndexingStatus(ProgressStatus.IN_PROGRESS);
          } else {
            context.setContractUpdatingStatus(ProgressStatus.IS_ERROR);
          }
        })
        .on("indexingStatus", (tx) => {
          if (tx.type === "success") {
            context.setIndexingStatus(ProgressStatus.IS_SUCCESS);
          } else {
            context.setIndexingStatus(ProgressStatus.IS_ERROR);
          }
        })
        .execute();

      if (result.type === "error") {
        console.error("failed to update application status", result.error);
      }

      return;
    }

    const updatedApplications = applications.map((application) => {
      const newStatus = {
        status: application.status,
        inReview: application.inReview,
      };

      const selectedApplication = selectedApplications.find(
        (selectedApplication) =>
          selectedApplication.applicationIndex === application.applicationIndex
      );

      if (selectedApplication) {
        newStatus.status = selectedApplication.status;
        newStatus.inReview = selectedApplication.inReview;
      }

      return { ...application, ...newStatus };
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
      const rowStatuses = fetchStatusesForPayoutStrategy(
        rowsToUpdate[i],
        updatedApplications
      );
      statusRows.push({
        index: rowsToUpdate[i],
        statusRow: createFullRowForPayoutStrategy(rowStatuses),
      });
    }

    const transactionBlockNumber = await updateContract({
      signer,
      roundId,
      payoutAddress: roundStrategyAddress,
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
    params: Omit<BulkUpdateGrantApplicationParams, "signer" | "context">
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
  payoutAddress?: string;
  statusRows: AppStatus[];
  context: BulkUpdateGrantApplicationState;
}

const updateContract = async ({
  signer,
  roundId,
  payoutAddress,
  statusRows,
  context,
}: UpdateContractParams): Promise<number> => {
  const { setContractUpdatingStatus } = context;

  try {
    setContractUpdatingStatus(ProgressStatus.IN_PROGRESS);

    const { transactionBlockNumber } = payoutAddress
      ? await updatePayoutApplicationStatuses(payoutAddress, signer, statusRows)
      : await updateApplicationStatuses(roundId, signer, statusRows);

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
