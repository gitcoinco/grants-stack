import { MintDonationButton } from "./MintDonattionButton";
import { ViewAttestationButton } from "./ViewAttestationButton";

export function MintingActionButton({
  transaction,
}: {
  transaction: {
    hash: string;
    chainId: number;
  };
}) {
  const isMinted = false;
  const canMint = true;

  return isMinted ? (
    <ViewAttestationButton
      onClick={() => {
        console.log(transaction.hash, "View attestation clicked");
      }}
    />
  ) : (
    <MintDonationButton
      disabled={!canMint}
      onClick={() => {
        console.log(transaction.hash, "Mint donation clicked");
      }}
    />
  );
}
