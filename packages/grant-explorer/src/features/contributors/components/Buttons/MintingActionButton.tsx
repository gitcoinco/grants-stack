import { Contribution, MintingAttestationIdsData } from "data-layer";
import { ViewAttestationButton } from "./ViewAttestationButton";
import { useState } from "react";
import useColorAndBackground from "../../../../hooks/attestations/useColorAndBackground";
import { MintDonationButton } from "./MintDonationButton";
import { MintDonationImpactAction } from "./MintDonationImpactAction";
import { ViewAttestationModal } from "../ViewAttestationModal/ViewAttestationModal";
import { generateTransactionUrl } from "../../../attestations/utils/generateTransactionUrl";

export function MintingActionButton({
  transaction,
  contributions,
  attestationData,
}: {
  transaction: {
    hash: string;
    chainId: number;
  };
  contributions: Contribution[];
  attestationData: {
    attestation?: MintingAttestationIdsData;
    isFetchingAttestations?: boolean;
    refetch?: () => void;
  };
}) {
  const [isOpen, setIsOpen] = useState({
    mintingModal: false,
    viewAttestationModal: false,
  });
  const [isActionStarted, setIsActionStarted] = useState(false);

  function toggleModal(modal: "mintingModal" | "viewAttestationModal") {
    setIsOpen({ ...isOpen, [modal]: !isOpen[modal] });
  }

  function toggleMintingModal() {
    toggleModal("mintingModal");
  }

  function toggleViewAttestationModal() {
    toggleModal("viewAttestationModal");
  }

  function HandleActionState(started: boolean) {
    setIsActionStarted(started);
  }

  const { attestation, isFetchingAttestations = false } = attestationData;

  const impactImageCid =
    attestation?.attestation?.metadata?.[0]?.impactImageCid;

  const isMinted = !!attestation;

  const {
    selectedColor,
    previewBackground,
    selectBackground,
    selectedBackground,
  } = useColorAndBackground();

  const { attestationChainId: chainId, attestationUid = "" } =
    attestation ?? {};

  const attestationLink = `https://attestation.gitcoin.co/attestation/${attestationUid}`;

  return isMinted ? (
    <>
      <ViewAttestationModal
        isOpen={isOpen.viewAttestationModal}
        onClose={toggleViewAttestationModal}
        impactImageCid={impactImageCid}
        transactionUrl={generateTransactionUrl({
          attestationUid,
          chainId: Number(chainId),
        })}
        attestationLink={attestationLink}
      />
      <ViewAttestationButton onClick={toggleViewAttestationModal} />
    </>
  ) : (
    <>
      <MintDonationImpactAction
        startAction={isActionStarted}
        toggleStartAction={HandleActionState}
        isOpen={isOpen.mintingModal}
        toggleModal={toggleMintingModal}
        contributions={contributions}
        transactionHash={transaction.hash}
        selectedColor={selectedColor}
        previewBackground={previewBackground}
        selectBackground={selectBackground}
        selectedBackground={selectedBackground}
      />
      <MintDonationButton
        disabled={isFetchingAttestations}
        onClick={toggleMintingModal}
      />
    </>
  );
}
