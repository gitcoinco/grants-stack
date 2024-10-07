import { HiddenAttestationFrame } from "../../../attestations/MintYourImpactComponents";
import MintAttestationProgressModal from "../../../attestations/MintAttestationProgressModal";
import { MintProgressModalBodyHistory } from "../../../attestations/MintProgressModalBody";
import { useGetAttestationData } from "../../../../hooks/attestations/useGetAttestationData";
import { useEASAttestation } from "../../../../hooks/attestations/useEASAttestation";
import { useResolveENS } from "../../../../hooks/useENS";
import { handleGetAttestationPreview } from "../../../../hooks/attestations/utils/getAttestationPreview";
import { useParams } from "react-router-dom";

import { useAccount, useBalance } from "wagmi";
import { useGetImages } from "../../../../hooks/attestations/useGetImages";
import { getContributionFrameProps } from "../../utils/getContributionFrameProps";
import { MintDonationButton } from "./MintDonationButton";
import { Contribution } from "data-layer";
import { ProgressStatus } from "../../../../hooks/attestations/config";
import { useEstimateGas } from "../../../../hooks/attestations/useEstimateGas";

import {
  AttestationChainId,
  AttestationFee,
} from "../../../attestations/utils/constants";
import { ethers } from "ethers";

interface MintDonationImpactActionProps {
  toggleModal: () => void;
  toggleStartAction: (started: boolean) => void;
  selectBackground: (background: string) => void;
  startAction: boolean;
  isOpen: boolean;
  contributions: Contribution[];
  transactionHash: string;
  selectedColor: string;
  previewBackground: string;
  selectedBackground: string;
}
export function MintDonationImpactAction({
  startAction,
  isOpen,
  toggleModal,
  toggleStartAction,
  contributions,
  transactionHash,
  selectedColor,
  previewBackground,
  selectBackground,
  selectedBackground,
}: MintDonationImpactActionProps) {
  const { address } = useAccount();
  const { address: contributorAddress } = useParams();
  const { data: name, isLoading: isLoadingENS } = useResolveENS(
    contributorAddress as `0x${string}` | undefined
  );

  const FrameProps = getContributionFrameProps(contributions);

  const frameId = ethers.utils.solidityKeccak256(
    ["string[]"],
    [[transactionHash]]
  );

  const { data: imagesBase64, isLoading: isLoadingImages } = useGetImages(
    FrameProps.projects.map((project) => project.image),
    isOpen
  );

  const { data, isLoading, isRefetching } = useGetAttestationData(
    [transactionHash],
    handleGetAttestationPreview,
    isLoadingENS || isLoadingImages || !isOpen || !startAction,
    selectedColor
  );

  const {
    data: gasEstimation,
    isLoading: loadingGasEstimate,
    isRefetching: isRefetchingEstimate,
  } = useEstimateGas(
    AttestationChainId,
    !isLoading && !isRefetching,
    data?.data
  );

  const { handleAttest, handleSwitchChain, status } = useEASAttestation(
    AttestationChainId,
    () => {},
    data?.data
  );

  const { data: balance } = useBalance({
    chainId: AttestationChainId,
    address: address,
  });

  const notEnoughFunds =
    balance?.value && gasEstimation
      ? balance.value <= AttestationFee + gasEstimation
      : false;

  const title =
    status !== ProgressStatus.IS_SUCCESS
      ? "Mint your impact"
      : "Your donation impact";

  const subheading =
    status !== ProgressStatus.IS_SUCCESS
      ? "Your unique donation graphic will be generated after you mint."
      : "Share with your friends";

  const loading =
    isLoading || isLoadingENS || isRefetching || isRefetchingEstimate;

  const isMinted = false;

  return (
    <>
      <MintDonationButton
        toggleModal={toggleModal}
        isOpen={!isOpen}
        isMinted={isMinted}
      />

      <MintAttestationProgressModal
        isOpen={isOpen}
        onClose={() => {
          toggleModal();
          toggleStartAction(false);
        }}
        heading={title}
        subheading={subheading}
        body={
          <MintProgressModalBodyHistory
            handleSwitchChain={handleSwitchChain}
            status={status}
            gasEstimation={gasEstimation}
            isLoadingEstimation={loadingGasEstimate}
            notEnoughFunds={notEnoughFunds}
            handleAttest={handleAttest}
            isLoading={loading}
            selectBackground={selectBackground}
            previewBackground={previewBackground}
            selectedColor={selectedColor}
            isTransactionHistoryPage
            toggleStartAction={() => toggleStartAction(true)}
            impactImageCid={data?.impactImageCid}
          />
        }
      />
      <HiddenAttestationFrame
        FrameProps={FrameProps}
        selectedBackground={selectedBackground}
        address={contributorAddress}
        name={name}
        imagesBase64={imagesBase64}
        frameId={frameId}
      />
    </>
  );
}
