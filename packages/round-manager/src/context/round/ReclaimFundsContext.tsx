import React, {
  createContext,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ProgressStatus } from "../../features/api/types";

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

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
  const context = useContext(ReclaimFundsContext);
  if (context === undefined) {
    throw new Error(
      "useReclaimFunds must be used within a ReclaimFundsProvider"
    );
  }

  const { reclaimStatus, setReclaimStatus } = context;

  const reclaimFunds = async () => {
    // Add the logic for reclaiming funds here
  };

  return {
    reclaimFunds,
    reclaimStatus,
  };
};
