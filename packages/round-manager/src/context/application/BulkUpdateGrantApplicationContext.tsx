import { GrantApplication, ProgressStatus } from "../../features/api/types";
import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { datadogLogs } from "@datadog/browser-logs";
import { Allo, RoundStrategyType } from "common";
import { Address } from "viem";
import { RoundCategory } from "data-layer";

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

async function _bulkUpdateGrantApplication({
  context,
  roundId,
  roundStrategy,
  roundStrategyAddress,
  applications,
  selectedApplications,
  allo,
}: BulkUpdateGrantApplicationParams) {
  resetToInitialState(context);
  try {
    context.setContractUpdatingStatus(ProgressStatus.IN_PROGRESS);

    const strategy =
      roundStrategy == "DirectGrants"
        ? RoundCategory.Direct
        : RoundCategory.QuadraticFunding;

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
        strategy: strategy,
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

  const handleBulkUpdateGrantApplications = async (
    params: Omit<BulkUpdateGrantApplicationParams, "context">
  ) => {
    return _bulkUpdateGrantApplication({
      ...params,
      context,
    });
  };

  return {
    bulkUpdateGrantApplications: handleBulkUpdateGrantApplications,
    contractUpdatingStatus: context.contractUpdatingStatus,
    indexingStatus: context.indexingStatus,
  };
};
