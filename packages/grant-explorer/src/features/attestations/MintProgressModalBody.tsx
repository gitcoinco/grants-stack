import { useState } from "react";
import { Button } from "common/src/styles";
import ethereumIcon from "../../assets/icons/ethereum-icon.svg";
import processingIcon from "../../assets/processing.svg";
import warningIcon from "../../assets/warning.svg";
import { ProgressStatus } from "../../hooks/attestations/config";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ImpactMintingSuccess,
  PreviewFrameHistoryPage,
} from "./MintYourImpactComponents";
import { CostDetails } from "./MintCostDetails";
import { formatAmount } from "./utils/formatAmount";
import { AttestationChainId, AttestationFee } from "./utils/constants";

type MintProgressModalBodyProps = {
  handleSwitchChain: () => Promise<void>;
  handleAttest: () => Promise<void>;
  toggleStartAction: () => void;
  selectBackground?: (background: string) => void;

  status: ProgressStatus;
  isLoading: boolean;
  impactImageCid: string;
  gasEstimation: bigint | undefined;
  notEnoughFunds: boolean;
  isLoadingEstimation: boolean;
  isTransactionHistoryPage?: boolean;
  previewBackground?: string;
  selectedColor?: string;
};

export function MintProgressModalBody({
  handleSwitchChain,
  status,
  gasEstimation,
  isLoadingEstimation,
  notEnoughFunds,
  handleAttest,
  toggleStartAction,
  isLoading,
  selectBackground,
  isTransactionHistoryPage,
  selectedColor,
  previewBackground,
  impactImageCid,
}: MintProgressModalBodyProps) {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    chainId: AttestationChainId,
    address,
  });
  const [nextStep, setNextStep] = useState(false);

  return (
    <div className="min-w-full min-h-full">
      {isTransactionHistoryPage && !nextStep ? (
        <div className="flex flex-col items-center justify-center">
          <PreviewFrameHistoryPage
            selectBackground={selectBackground as () => void}
            nextStep={() => {
              toggleStartAction();
              setNextStep(true);
            }}
            previewBackground={previewBackground as string}
            selectedColor={selectedColor as string}
          />
        </div>
      ) : status === ProgressStatus.IS_SUCCESS && !isTransactionHistoryPage ? (
        <ImpactMintingSuccess impactImageCid={impactImageCid} />
      ) : (
        <div className="flex flex-col items-start justify-center">
          {status === ProgressStatus.IS_ERROR && (
            <div className="w-full flex flex-col rounded-lg p-2 text-left bg-[#FFD9CD]">
              <div className="flex items-center">
                <img
                  src={warningIcon}
                  alt="errorIcon"
                  className="h-4 w-4 mr-2"
                />
                <div className="text-md font-modern-era-medium">Error</div>
              </div>
              <div className="text-sm font-modern-era-medium">
                Transaction failed. Please try again.
              </div>
            </div>
          )}

          <div className="w-full flex flex-wrap border rounded-lg p-3 my-auto">
            <div className="flex items-center">
              <img src={ethereumIcon} alt="Ethereum" className="h-8 w-8" />
              <div className="ml-5">
                <span className="text-lg font-bold">Mainnet</span>
                <div className="text-sm font-mono">
                  {notEnoughFunds ? (
                    <div className="flex items-center text-red-500">
                      <img
                        src={warningIcon}
                        alt="errorIcon"
                        className="h-4 w-4 mr-2"
                      />
                      <span>Balance: {formatAmount(balance?.value)} ETH</span>
                    </div>
                  ) : (
                    <span>Balance: {formatAmount(balance?.value)} ETH</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CostDetails
            isLoading={isLoadingEstimation}
            attestationFee={AttestationFee}
            estimatedGas={gasEstimation}
          />

          {!isConnected ? (
            <Button className="bg-[#DE3714] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md">
              <ConnectButton />
            </Button>
          ) : status === ProgressStatus.SWITCH_CHAIN ? (
            <Button
              onClick={handleSwitchChain}
              className="bg-[#DE3714] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md"
            >
              Switch Chain
            </Button>
          ) : notEnoughFunds ? (
            <div className="w-full flex flex-col items-start gap-3">
              <span className="p-2 text-sm font-modern-era-medium">
                Insufficient funds to complete the minting process. Please
                bridge or add funds to your wallet to proceed.
              </span>
              <Button className="bg-[#DE3714] text-white font-mono text-md w-full px-4 pb-2 rounded-lg hover:shadow-md">
                Bridge Funds
              </Button>
            </div>
          ) : status === ProgressStatus.NOT_STARTED ||
            status === ProgressStatus.IS_ERROR ? (
            <Button
              onClick={handleAttest}
              className="bg-[#00433B] text-white font-mono text-md w-full px-4 py-2 rounded-lg hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Mint"}
            </Button>
          ) : (
            status === ProgressStatus.IN_PROGRESS && (
              <Button className="bg-[#00433B] text-white w-full font-mono text-md px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-md">
                <img
                  src={processingIcon}
                  alt="Processing Icon"
                  className="w-5 h-5 animate-reverse-spin"
                />
                <span>Processing</span>
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
