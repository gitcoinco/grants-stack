import { TableHeader } from "./TableHeader";
import { TransactionHeader } from "./TransactionHeader";
import { RoundAccordion } from "../RoundAccordion";
import { ContributionsByRoundId } from "../../types";

export function DonationsTransactionTable({
  transactionHash,
  contributions = {},
}: {
  transactionHash: string;
  contributions?: ContributionsByRoundId;
}) {
  const roundIds = Object.keys(contributions);
  const nRounds = roundIds.length;

  if (nRounds === 0) return null;

  const transactionChainId = contributions[roundIds[0]][0].chainId;

  return (
    <div>
      <TransactionHeader
        transactionHash={transactionHash}
        transactionChainId={transactionChainId}
      />
      <TableHeader />
      {roundIds.map((roundId) => (
        <RoundAccordion contributions={contributions[roundId]} />
      ))}
    </div>
  );
}
