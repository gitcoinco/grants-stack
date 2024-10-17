import { MintProgressModalBodyHistory } from "../../../attestations/MintProgressModalBody";
import { useGetAttestationData } from "../../../../hooks/attestations/useGetAttestationData";
import { useEASAttestation } from "../../../../hooks/attestations/useEASAttestation";

import { useAccount, useBalance } from "wagmi";
import { Contribution } from "data-layer";
import { ProgressStatus } from "../../../../hooks/attestations/config";
import { useEstimateGas } from "../../../../hooks/attestations/useEstimateGas";

import { AttestationChainId } from "../../../attestations/utils/constants";
import { useAttestationFee } from "../../hooks/useMintingAttestations";
import { useMemo } from "react";
import Modal from "../../../common/components/Modal";

interface MintDonationImpactActionProps {
  toggleModal: () => void;
  toggleStartAction: (started: boolean) => void;
  selectBackground: (background: string) => void;
  startAction: boolean | undefined;
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
  transactionHash,
  selectedColor,
  previewBackground,
  selectBackground,
}: MintDonationImpactActionProps) {
  const { address } = useAccount();

  const { data, isLoading, isRefetching } = useGetAttestationData(
    [transactionHash],
    !isOpen || !startAction,
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

  const { data: attestationFee } = useAttestationFee();

  const { handleAttest, handleSwitchChain, status, updateStatus } =
    useEASAttestation(
      AttestationChainId,
      () => null,
      data?.data,
      attestationFee,
      true
    );

  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    chainId: AttestationChainId,
    address: address,
  });

  const notEnoughFunds =
    isLoadingBalance || balance?.value === undefined
      ? false
      : balance.value < attestationFee + (gasEstimation ?? 0n);

  // Use useMemo to memoize title and subheading
  const { title, subheading } = useMemo(() => {
    const newTitle =
      status === ProgressStatus.SELECTING_COLOR
        ? "Mint your impact!"
        : status !== ProgressStatus.IS_SUCCESS
          ? "Mint your impact"
          : "Your donation impact";

    const newSubheading =
      status === ProgressStatus.SELECTING_COLOR
        ? "Capture your contribution onchain with an attestation and receive a unique visual representation of your donation. Please note, this is not an NFT, but an onchain attestation that verifies your support."
        : status !== ProgressStatus.IS_SUCCESS
          ? "Your attestation will be generated after you mint. "
          : "Congratulations! Your attestation is now onchain, and here's the unique visual that represents your donation. Share your impact with your community and inspire others to join in!";

    return { title: newTitle, subheading: newSubheading };
  }, [status]);
  const loading = isLoading || isRefetching || isRefetchingEstimate;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          toggleModal();
          toggleStartAction(false);
          setTimeout(() => {
            updateStatus(ProgressStatus.SELECTING_COLOR);
          }, 500);
        }}
        padding="p-0"
      >
        <MintProgressModalBodyHistory
          heading={title}
          subheading={subheading}
          attestationFee={attestationFee}
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
          toggleStartAction={() => {
            toggleStartAction(true);
            updateStatus(ProgressStatus.NOT_STARTED);
          }}
          impactImageCid={data?.impactImageCid}
        />
      </Modal>
    </>
  );
}
