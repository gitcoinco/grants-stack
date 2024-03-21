import React, {
  createContext,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ProgressStatus } from "../../features/api/types";
import { Allo } from "common";
import { getAddress } from "viem";

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

export type ReclaimFundsParams = {
  allo: Allo;
  payoutStrategy: string;
  token: string;
  recipient: string;
};

export type SubmitReclaimFundsParams = {
  allo: Allo;
  payoutStrategy: string;
  token: string;
  recipient: string;
  context: ReclaimFundsState;
};

export interface ReclaimFundsState {
  reclaimStatus: ProgressStatus;
  setReclaimStatus: SetStatusFn;
}

export const initialReclaimFundsState: ReclaimFundsState = {
  reclaimStatus: ProgressStatus.NOT_STARTED,
  setReclaimStatus: () => {
    /* provided in ReclaimFundsProvider */
  },
};

export const ReclaimFundsContext = createContext<ReclaimFundsState>(
  initialReclaimFundsState
);

export const ReclaimFundsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [reclaimStatus, setReclaimStatus] = useState(
    initialReclaimFundsState.reclaimStatus
  );

  const providerProps: ReclaimFundsState = {
    reclaimStatus,
    setReclaimStatus,
  };

  return (
    <ReclaimFundsContext.Provider value={providerProps}>
      {children}
    </ReclaimFundsContext.Provider>
  );
};

export const useReclaimFunds = () => {
  const context = useContext<ReclaimFundsState>(ReclaimFundsContext);
  if (context === undefined) {
    throw new Error(
      "useReclaimFunds must be used within a ReclaimFundsProvider"
    );
  }

  const handleReclaimFunds = async (params: ReclaimFundsParams) => {
    return _reclaimFunds({ ...params, context });
  };

  return {
    reclaimFunds: handleReclaimFunds,
    reclaimStatus: context.reclaimStatus,
  };
};

const _reclaimFunds = async ({
  allo,
  payoutStrategy,
  token,
  recipient,
  context,
}: SubmitReclaimFundsParams) => {
  resetToInitialState(context);

  try {
    context.setReclaimStatus(ProgressStatus.IN_PROGRESS);
    const payoutStrategyAddress = getAddress(payoutStrategy);
    const tokenAddress = getAddress(token);
    const recipientAddress = getAddress(recipient);

    const result = await allo
      .withdrawFundsFromStrategy({
        payoutStrategyAddress,
        tokenAddress,
        recipientAddress,
      })
      .on("transaction", (tx) => {
        if (tx.type === "error") {
          context.setReclaimStatus(ProgressStatus.IS_ERROR);
        }
      })
      .on("transactionStatus", (tx) => {
        if (tx.type === "error") {
          context.setReclaimStatus(ProgressStatus.IS_ERROR);
        } else {
          context.setReclaimStatus(ProgressStatus.IS_SUCCESS);
        }
      })
      .execute();

    if (result.type === "error") {
      throw result.error;
    }
  } catch (error) {
    console.error("Error while reclaiming funds: ", error);
    context.setReclaimStatus(ProgressStatus.IS_ERROR);
  }
};

function resetToInitialState(context: ReclaimFundsState) {
  const { setReclaimStatus } = context;

  setReclaimStatus(ProgressStatus.NOT_STARTED);
}
