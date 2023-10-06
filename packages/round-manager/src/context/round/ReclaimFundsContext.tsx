import { Signer } from "ethers";
import React, {
  createContext,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { useSigner } from "wagmi";
import { reclaimFundsFromContract } from "../../features/api/payoutStrategy/payoutStrategy";
import { ProgressStatus } from "../../features/api/types";

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

export type ReclaimFundsParams = {
  payoutStrategy: string;
  recipientAddress: string;
};

export type SubmitReclaimFundsParams = {
  payoutStrategy: string;
  recipientAddress: string;
  signer: Signer;
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

  const { data: signer } = useSigner();

  const handleReclaimFunds = async (params: ReclaimFundsParams) => {
    return _reclaimFunds({ ...params, signer: signer as Signer, context });
  };

  return {
    reclaimFunds: handleReclaimFunds,
    reclaimStatus: context.reclaimStatus,
  };
};

const _reclaimFunds = async ({
  payoutStrategy,
  recipientAddress,
  signer,
  context,
}: SubmitReclaimFundsParams) => {
  resetToInitialState(context);
  const { setReclaimStatus } = context;
  try {
    setReclaimStatus(ProgressStatus.IN_PROGRESS);
    const { transactionBlockNumber } = await reclaimFundsFromContract(
      payoutStrategy,
      signer,
      recipientAddress
    );
    setReclaimStatus(ProgressStatus.IS_SUCCESS);
    return transactionBlockNumber;
  } catch (error) {
    console.error("Error while reclaiming funds: ", error);
    setReclaimStatus(ProgressStatus.IS_ERROR);
  }
};

function resetToInitialState(context: ReclaimFundsState) {
  const { setReclaimStatus } = context;

  setReclaimStatus(ProgressStatus.NOT_STARTED);
}
