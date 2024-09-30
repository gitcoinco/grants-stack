import { useState } from "react";
import { ProgressStatus } from "./config";

/**
 * Hook to manage attestation status.
 */
export const useAttestationStatus = (initialStatus: ProgressStatus) => {
  const [status, setStatus] = useState<ProgressStatus>(initialStatus);

  const updateStatus = (newStatus: ProgressStatus) => {
    setStatus(newStatus);
  };

  return { status, updateStatus };
};
