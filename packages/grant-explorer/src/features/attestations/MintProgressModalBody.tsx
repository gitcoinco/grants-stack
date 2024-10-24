import { PropsWithChildren, useState } from "react";
import { ProgressStatus } from "../../hooks/attestations/config";
import { useAccount, useBalance } from "wagmi";
import {
  ImpactMintingSuccess,
  PreviewFrameHistoryPage,
} from "./MintYourImpactComponents";
import { AttestationChainId } from "./utils/constants";
import { MintingProcessContent } from "./components/index";
import { useAttestationFee } from "../contributors/hooks/useMintingAttestations";

type MintProgressModalBodyProps = {
  handleSwitchChain: () => Promise<void>;
  handleAttest: () => Promise<void | string | undefined>;
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
  attestationFee: bigint;
  heading?: string;
  subheading?: string;
};

const MintProgressModalBody = ({
  heading,
  subheading,
  children,
  isOnAction,
}: PropsWithChildren<{
  heading: string;
  subheading: string;
  isOnAction: boolean;
}>) => (
  <div
    className={`max-w-[710px] p-6 flex flex-col justify-center text-black ${!isOnAction ? "sm:p-10 items-center text-center gap-2 sm:gap-6" : "gap-8"}`}
  >
    <div className={`flex flex-col gap-2 ${isOnAction ? "" : "sm:gap-6"}`}>
      <div
        className={`${isOnAction ? "text-3xl/[34px]" : "text-5xl/[39px]"} font-modern-era-bold`}
      >
        {heading}
      </div>
      <div
        className={`${isOnAction ? "text-[16px]/[26px]" : "text-[20px]/[26px]"} font-modern-era-regular`}
      >
        {subheading}
      </div>
    </div>
    <div className="flex flex-col justify-center items-center w-full">
      <div className="min-w-[288px] sm:w-[405px] w-full">{children}</div>
    </div>
  </div>
);

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
    heading,
    subheading,
  } = props;

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    chainId: AttestationChainId,
    address,
  });
  const { data: attestationFee } = useAttestationFee();

  return (
    <MintProgressModalBody
      heading={heading ?? ""}
      subheading={subheading ?? ""}
      isOnAction={true}
    >
      <MintingProcessContent
        status={status}
        balance={balance?.value}
        notEnoughFunds={notEnoughFunds}
        isLoadingEstimation={isLoadingEstimation}
        gasEstimation={gasEstimation}
        isConnected={isConnected}
        attestationFee={attestationFee}
        handleSwitchChain={handleSwitchChain}
        handleAttest={handleAttest}
        isLoading={isLoading}
      />
    </MintProgressModalBody>
  );
}

// MintProgressModalBodyHistory component
export function MintProgressModalBodyHistory(
  props: MintProgressModalBodyProps
) {
  const {
    attestationFee,
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
    heading,
    subheading,
  } = props;

  const [attestationLink, setAttestationLink] = useState<string | undefined>(
    undefined
  );

  const attest = async () => {
    setAttestationLink((await handleAttest()) as string);
  };

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    chainId: AttestationChainId,
    address,
  });

  const isOnAction =
    status !== ProgressStatus.SELECTING_COLOR &&
    status !== ProgressStatus.IS_SUCCESS;

  return (
    <MintProgressModalBody
      heading={heading ?? ""}
      subheading={subheading ?? ""}
      isOnAction={isOnAction}
    >
      {status === ProgressStatus.SELECTING_COLOR ? (
        <PreviewFrameHistoryPage
          selectBackground={selectBackground as () => void}
          nextStep={() => {
            toggleStartAction?.();
          }}
          previewBackground={previewBackground as string}
          selectedColor={selectedColor as string}
        />
      ) : status === ProgressStatus.IS_SUCCESS ? (
        <ImpactMintingSuccess
          impactImageCid={impactImageCid as string}
          attestationLink={attestationLink ?? ""}
          isShareButtonsAbove={false}
          imageSize="size-[288px] sm:size-[400px]"
        />
      ) : (
        <MintingProcessContent
          status={status}
          balance={balance?.value}
          notEnoughFunds={notEnoughFunds}
          isLoadingEstimation={isLoadingEstimation}
          gasEstimation={gasEstimation}
          isConnected={isConnected}
          handleSwitchChain={handleSwitchChain}
          handleAttest={attest}
          isLoading={isLoading}
          attestationFee={attestationFee}
        />
      )}
    </MintProgressModalBody>
  );
}
