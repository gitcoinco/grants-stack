import { DonationsTransactionTable } from "./DonationsTransactionTable";
import { ContributionsByHashAndRoundId } from "../../types";

export function DonationsTable({
  contributions = {},
}: {
  contributions?: ContributionsByHashAndRoundId;
}) {
  const transactionHashes = Object.keys(contributions);

  if (transactionHashes.length === 0)
    return <div className="text-md text-center my-12">No Donations found</div>;

  return (
    <>
      {transactionHashes.map((transactionHash) => (
        <DonationsTransactionTable
          key={transactionHash}
          transactionHash={transactionHash}
          contributions={contributions[transactionHash]}
        />
      ))}
    </>
  );
}
