import { ProgressStatus } from "../../../hooks/attestations/config";
import { AttestationFee } from "../utils/constants";
import {
  ErrorMessage,
  BalanceDisplay,
  CostDetails,
  ActionButton,
} from "./index";

// Extracted MintingProcessContent component
export const MintingProcessContent = ({
  status,
  balance,
  notEnoughFunds,
  isLoadingEstimation,
  gasEstimation,
  isConnected,
  handleSwitchChain,
  handleAttest,
  isLoading,
}: {
  status: ProgressStatus;
  balance: bigint | undefined;
  notEnoughFunds: boolean;
  isLoadingEstimation: boolean;
  gasEstimation: bigint | undefined;
  isConnected: boolean;
  handleSwitchChain: () => Promise<void>;
  handleAttest: () => Promise<void>;
  isLoading: boolean;
}) => (
  <div className="flex flex-col items-start justify-center">
    {status === ProgressStatus.IS_ERROR && <ErrorMessage />}

    <BalanceDisplay balance={balance} notEnoughFunds={notEnoughFunds} />

    <CostDetails
      isLoading={isLoadingEstimation}
      attestationFee={AttestationFee}
      estimatedGas={gasEstimation}
    />

    <ActionButton
      isConnected={isConnected}
      status={status}
      handleSwitchChain={handleSwitchChain}
      handleAttest={handleAttest}
      notEnoughFunds={notEnoughFunds}
      isLoading={isLoading}
    />
  </div>
);
