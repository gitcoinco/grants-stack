import { useDataLayer } from "data-layer";
import { useQuery } from "@tanstack/react-query";
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
  const { hash: transactionHash, chainId } = transaction;
  const dataLayer = useDataLayer();

  const { data: attestations } = useQuery({
    queryKey: [`attestationsIdsByDonationTransaction-${[transactionHash]}`],
    enabled: !!transactionHash,
    queryFn: () =>
      dataLayer.getMintingAttestationIdsByTransactionHash({
        transactionHashes: [transactionHash],
      }),
  });

  console.log("DEBUG mintingActionButton", {
    transactionHash,
    attestations,
  });
  const nAttestations = attestations?.length ?? 0;
  const isMinted = nAttestations > 0;
  const canMint = true; // TODO

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
