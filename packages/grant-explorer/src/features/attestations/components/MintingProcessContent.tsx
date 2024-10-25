import { ProgressStatus } from "../../../hooks/attestations/config";
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
  attestationFee,
}: {
  status: ProgressStatus;
  balance: bigint | undefined;
  notEnoughFunds: boolean;
  isLoadingEstimation: boolean;
  gasEstimation: bigint | undefined;
  isConnected: boolean;
  handleSwitchChain: () => Promise<void>;
  handleAttest: () => Promise<void | string | undefined>;
  isLoading: boolean;
  attestationFee: bigint;
}) => (
  <div className="flex flex-col gap-6 items-start justify-center w-full">
    {status === ProgressStatus.IS_ERROR && <ErrorMessage />}

    <BalanceDisplay balance={balance} notEnoughFunds={notEnoughFunds} />

    <CostDetails
      isLoading={isLoadingEstimation}
      attestationFee={attestationFee}
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
