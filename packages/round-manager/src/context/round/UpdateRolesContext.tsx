import React, { SetStateAction, createContext, useContext } from "react";
import { ProgressStatus } from "../../features/api/types";
import { Allo } from "common";
import { Hex } from "viem";
import { datadogLogs } from "@datadog/browser-logs";

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

export enum AddOrRemove {
  ADD = "add",
  REMOVE = "remove",
}

export type UpdateRolesData = {
  roundId: string;
  manager: Hex;
  addOrRemove: AddOrRemove;
  allo: Allo;
};

export interface UpdateRolesState {
  contractUpdatingStatus: ProgressStatus;
  setContractUpdatingStatus: SetStatusFn;
  indexingStatus: ProgressStatus;
  setIndexingStatus: SetStatusFn;
}

export const initialUpdateRolesState: UpdateRolesState = {
  contractUpdatingStatus: ProgressStatus.IN_PROGRESS,
  setContractUpdatingStatus: () => {
    /* empty */
  },
  indexingStatus: ProgressStatus.NOT_STARTED,
  setIndexingStatus: () => {
    /* empty */
  },
};

export const UpdateRolesContext = createContext<UpdateRolesState>(
  initialUpdateRolesState
);

export const UpdateRolesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [contractUpdatingStatus, setContractUpdatingStatus] =
    React.useState<ProgressStatus>(
      initialUpdateRolesState.contractUpdatingStatus
    );

  const [indexingStatus, setIndexingStatus] = React.useState<ProgressStatus>(
    initialUpdateRolesState.indexingStatus
  );

  const providerProps: UpdateRolesState = {
    contractUpdatingStatus,
    setContractUpdatingStatus,
    indexingStatus,
    setIndexingStatus,
  };

  return (
    <UpdateRolesContext.Provider value={providerProps}>
      {children}
    </UpdateRolesContext.Provider>
  );
};

interface _updateRolesParams {
  context: UpdateRolesState;
  UpdateRolesData: UpdateRolesData;
}

const _updateRoles = async ({
  context,
  UpdateRolesData,
}: _updateRolesParams) => {
  const { roundId, manager, addOrRemove, allo } = UpdateRolesData;
  const { setContractUpdatingStatus, setIndexingStatus } = context;

  await allo
    .managePoolManager({
      poolId: roundId,
      manager,
      addOrRemove,
    })
    .on("transactionStatus", (res) => {
      if (res.type === "success") {
        setContractUpdatingStatus(ProgressStatus.IS_SUCCESS);
        setIndexingStatus(ProgressStatus.IN_PROGRESS);
      } else {
        console.error("Transaction Status Error", res.error);
        datadogLogs.logger.error(`_updateRoles: ${res.error}`);
        setContractUpdatingStatus(ProgressStatus.IS_ERROR);
      }
    })
    .on("indexingStatus", (res) => {
      if (res.type === "success") {
        setIndexingStatus(ProgressStatus.IS_SUCCESS);
      } else {
        console.error("Indexing Status Error", res.error);
        datadogLogs.logger.error(`_updateRoles: ${res.error}`);
        setIndexingStatus(ProgressStatus.IS_ERROR);
      }
    })
    .execute();
};

export const useUpdateRoles = () => {
  const context = useContext(UpdateRolesContext);
  if (!context) throw new Error("Missing UpdateRolesContext");

  const { setContractUpdatingStatus, setIndexingStatus } = context;

  const updateRoles = async (UpdateRolesData: UpdateRolesData) => {
    setContractUpdatingStatus(initialUpdateRolesState.contractUpdatingStatus);
    setIndexingStatus(initialUpdateRolesState.indexingStatus);

    return _updateRoles({
      context,
      UpdateRolesData,
    });
  };

  return {
    updateRoles,
    contractUpdatingStatus: context.contractUpdatingStatus,
    indexingStatus: context.indexingStatus,
  };
};
