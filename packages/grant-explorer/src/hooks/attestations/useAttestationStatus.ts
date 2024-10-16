import { useMemo, useState } from "react";
import { ProgressStatus } from "./config";
import { useAccount } from "wagmi";

/**
 * Hook to manage attestation status.
 */
export const useAttestationStatus = (
  chainId: number,
  isHistoryPage?: boolean
) => {
  const { chainId: userChainID } = useAccount();

  const requiresSwitch = chainId !== userChainID;

  const initialStatus = useMemo(() => {
    return requiresSwitch
      ? ProgressStatus.SWITCH_CHAIN
      : isHistoryPage
        ? ProgressStatus.SELECTING_COLOR
        : ProgressStatus.NOT_STARTED;
  }, [requiresSwitch, isHistoryPage]);

  const [status, setStatus] = useState<ProgressStatus>(initialStatus);

  const updateStatus = (newStatus: ProgressStatus) => {
    setStatus(newStatus);
  };

  return {
    status: requiresSwitch ? ProgressStatus.SWITCH_CHAIN : status,
    updateStatus,
  };
};
