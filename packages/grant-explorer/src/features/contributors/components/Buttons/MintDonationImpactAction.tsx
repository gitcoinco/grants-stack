import { HiddenAttestationFrame } from "../../../attestations/MintYourImpactComponents";
import MintAttestationProgressModal from "../../../attestations/MintAttestationProgressModal";
import { MintProgressModalBody } from "../../../attestations/MintProgressModalBody";
import { useGetAttestationData } from "../../../../hooks/attestations/useGetAttestationData";
import { useEASAttestation } from "../../../../hooks/attestations/useEASAttestation";
import { useResolveENS } from "../../../../hooks/useENS";
import { handleGetAttestationPreview } from "../../../../hooks/attestations/utils/getAttestationPreview";

import { useAccount } from "wagmi";
import { useGetImages } from "../../../../hooks/attestations/useGetImages";
import { getContributionFrameProps } from "../../utils/getContributionFrameProps";
import { MintDonationButton } from "./MintDonationButton";
import { Contribution } from "data-layer";
import { ProgressStatus } from "../../../../hooks/attestations/config";
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
}: {
  startAction: boolean;
  isOpen: boolean;
  toggleModal: () => void;
  toggleStartAction: (started: boolean) => void;
  contributions: Contribution[];
  transactionHash: string;
  selectedColor: string;
  previewBackground: string;
  selectBackground: (background: string) => void;
  selectedBackground: string;
}) {
  const { address } = useAccount();
  const { data: name, isLoading: isLoadingENS } = useResolveENS(address);

  const FrameProps = getContributionFrameProps(contributions);
  const handleToggleModal = () => {
    toggleModal();
  };

  const chainId = 11155111;

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

  const { handleAttest, handleSwitchChain, status, GasEstimation } =
    useEASAttestation(chainId, handleToggleModal, data?.data);

  const title =
    status !== ProgressStatus.IS_SUCCESS
      ? "Mint your impact"
      : "Your donation impact";

  const subheading =
    status !== ProgressStatus.IS_SUCCESS
      ? "Your unique donation graphic will be generated after you mint."
      : "Share with your friends";

  return (
    <>
      <MintDonationButton toggleModal={toggleModal} isOpen={!isOpen} isMinted />

      <MintAttestationProgressModal
        isOpen={isOpen}
        onClose={() => {
          toggleModal();
          toggleStartAction(false);
        }}
        heading={title}
        subheading={subheading}
        body={
          <MintProgressModalBody
            handleSwitchChain={handleSwitchChain}
            status={status}
            GasEstimation={GasEstimation}
            handleAttest={handleAttest}
            isLoading={isLoading || isLoadingENS || isRefetching}
            selectBackground={selectBackground}
            previewBackground={previewBackground}
            selectedColor={selectedColor}
            isTransactionHistoryPage
            toggleStartAction={() => toggleStartAction(true)}
            metadataCid={data?.impactImageCid}
          />
        }
      />
      <HiddenAttestationFrame
        FrameProps={FrameProps}
        selectedBackground={selectedBackground}
        address={address}
        name={name}
        imagesBase64={imagesBase64}
      />
    </>
  );
}
