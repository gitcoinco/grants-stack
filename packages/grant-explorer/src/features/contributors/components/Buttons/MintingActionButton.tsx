import { Contribution } from "data-layer";
import { ViewAttestationButton } from "./ViewAttestationButton";
import { useState } from "react";
import useColorAndBackground from "../../../../hooks/attestations/useColorAndBackground";
import { MintDonationButton } from "./MintDonationButton";
import { MintDonationImpactAction } from "./MintDonationImpactAction";

export function MintingActionButton({
  transaction,
  contributions,
}: {
  transaction: {
    hash: string;
    chainId: number;
  };
  contributions: Contribution[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isActionStarted, setIsActionStarted] = useState(false);

  function toggleModal() {
    setIsOpen(!isOpen);
  }

  function HandleActionState(started: boolean) {
    setIsActionStarted(started);
  }

  const {
    selectedColor,
    previewBackground,
    selectBackground,
    selectedBackground,
  } = useColorAndBackground();

  const isMinted = false;
  // const canMint = true;

  return isMinted ? (
    <ViewAttestationButton
      onClick={() => {
        console.log(transaction.hash, "View attestation clicked");
      }}
    />
  ) : (
    <>
      <MintDonationImpactAction
        startAction={isActionStarted}
        toggleStartAction={HandleActionState}
        isOpen={isOpen}
        toggleModal={toggleModal}
        contributions={contributions}
        transactionHash={transaction.hash}
        selectedColor={selectedColor}
        previewBackground={previewBackground}
        selectBackground={selectBackground}
        selectedBackground={selectedBackground}
      />
      <MintDonationButton
        isMinted={isMinted}
        toggleModal={toggleModal}
        isOpen={isOpen}
      />
    </>
  );
}
