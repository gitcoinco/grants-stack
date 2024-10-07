import { useState } from "react";
import { ProgressStatus } from "../../hooks/attestations/config";
import { useAccount, useBalance } from "wagmi";
import {
  ImpactMintingSuccess,
  PreviewFrameHistoryPage,
} from "./MintYourImpactComponents";
import { AttestationChainId } from "./utils/constants";
import { MintingProcessContent } from "./components/index";

type MintProgressModalBodyProps = {
  handleSwitchChain: () => Promise<void>;
  handleAttest: () => Promise<void>;
  toggleStartAction?: () => void;
  selectBackground?: (background: string) => void;

  status: ProgressStatus;
  isLoading: boolean;
  impactImageCid?: string;
  gasEstimation: bigint | undefined;
  notEnoughFunds: boolean;
  isLoadingEstimation: boolean;
  isTransactionHistoryPage?: boolean;
  previewBackground?: string;
  selectedColor?: string;
};

// MintProgressModalBodyThankYou component
export function MintProgressModalBodyThankYou(
  props: MintProgressModalBodyProps
) {
  const {
    handleSwitchChain,
    status,
    gasEstimation,
    isLoadingEstimation,
    notEnoughFunds,
    handleAttest,
    isLoading,
  } = props;

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    chainId: AttestationChainId,
    address,
  });

  return (
    <div className="min-w-full min-h-full">
      <MintingProcessContent
        status={status}
        balance={balance?.value}
        notEnoughFunds={notEnoughFunds}
        isLoadingEstimation={isLoadingEstimation}
        gasEstimation={gasEstimation}
        isConnected={isConnected}
        handleSwitchChain={handleSwitchChain}
        handleAttest={handleAttest}
        isLoading={isLoading}
      />
    </div>
  );
}

// MintProgressModalBodyHistory component
export function MintProgressModalBodyHistory(
  props: MintProgressModalBodyProps
) {
  const {
    handleSwitchChain,
    status,
    gasEstimation,
    isLoadingEstimation,
    notEnoughFunds,
    handleAttest,
    toggleStartAction,
    isLoading,
    selectBackground,
    selectedColor,
    previewBackground,
    impactImageCid,
  } = props;

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    chainId: AttestationChainId,
    address,
  });
  const [nextStep, setNextStep] = useState(false);

  return (
    <div className="min-w-full min-h-full">
      {!nextStep ? (
        <div className="flex flex-col items-center justify-center">
          <PreviewFrameHistoryPage
            selectBackground={selectBackground as () => void}
            nextStep={() => {
              toggleStartAction?.();
              setNextStep(true);
            }}
            previewBackground={previewBackground as string}
            selectedColor={selectedColor as string}
          />
        </div>
      ) : status === ProgressStatus.IS_SUCCESS ? (
        <ImpactMintingSuccess impactImageCid={impactImageCid as string} />
      ) : (
        <MintingProcessContent
          status={status}
          balance={balance?.value}
          notEnoughFunds={notEnoughFunds}
          isLoadingEstimation={isLoadingEstimation}
          gasEstimation={gasEstimation}
          isConnected={isConnected}
          handleSwitchChain={handleSwitchChain}
          handleAttest={handleAttest}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
