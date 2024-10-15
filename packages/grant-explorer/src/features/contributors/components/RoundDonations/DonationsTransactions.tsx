import { RoundHeader } from "./RoundHeader";
import { TransactionHeader } from "./TransactionHeader";
import { RoundAccordion } from "../RoundAccordion";
import { ContributionsByRoundId } from "../../types";
import { MintingAttestationIdsData } from "data-layer";

export function DonationsTransactions({
  transactionHash,
  contributions = {},
  transactionAttestationsData,
}: {
  transactionHash: string;
  contributions?: ContributionsByRoundId;
  transactionAttestationsData: {
    attestationUid?: string;
    transactionAttestations?: MintingAttestationIdsData[];
    isFetchingAttestations?: boolean;
    refetch?: () => void;
  };
}) {
  const roundIds = Object.keys(contributions);

  const contributionsArray = Object.values(contributions).flat();

  const nRounds = roundIds.length;

  if (nRounds === 0) return null;

  const transactionChainId = contributions[roundIds[0]][0].chainId;

  const {
    transactionAttestations = [],
    isFetchingAttestations,
    refetch,
  } = transactionAttestationsData;

  const lastAttestation = transactionAttestations[0];

  return (
    <div className="flex flex-col gap-6">
      <TransactionHeader
        transactionHash={transactionHash}
        transactionChainId={transactionChainId}
        contributions={contributionsArray}
        attestationData={{
          attestation: lastAttestation,
          isFetchingAttestations,
          refetch,
        }}
      />
      <RoundHeader />
      {roundIds.map((roundId) => (
        <RoundAccordion key={roundId} contributions={contributions[roundId]} />
      ))}
    </div>
  );
}
