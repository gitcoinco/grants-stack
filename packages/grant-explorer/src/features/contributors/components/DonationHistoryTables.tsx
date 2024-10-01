import { DirectDonationsTable } from "./DirectDonationsTable";
import { DonationsTable } from "./DonationsTable";
import { ContributionsData } from "../types";

export function DonationHistoryTables({
  contributionsData,
}: {
  contributionsData?: ContributionsData;
}) {
  const {
    contributionsByStatusAndHashAndRoundId,
    contributionsToDirectGrants,
  } = contributionsData ?? {};

  const activeRoundDonations = contributionsByStatusAndHashAndRoundId?.active;
  const pastRoundDonations = contributionsByStatusAndHashAndRoundId?.past;
  const directAllocationDonations = contributionsToDirectGrants;

  const directAllocationDonationsArray = directAllocationDonations
    ? Object.values(directAllocationDonations).flat()
    : [];

  return (
    <>
      <div className="text-2xl mt-6 mb-10">Donation History</div>
      <div className="border-black mb-2 px-1 py-1 text-black text-lg border-b font-semibold">
        Active Rounds
      </div>
      <DonationsTable contributions={activeRoundDonations} />
      <div className="border-black mb-2 px-1 py-1 text-black text-lg border-b font-semibold">
        Past Rounds
      </div>
      <DonationsTable contributions={pastRoundDonations} />
      {/* Direct Allocation */}
      {directAllocationDonationsArray.length > 0 && (
        <>
          <div className="border-black mb-2 px-1 py-1 text-black text-lg border-b font-semibold">
            Direct Donations
          </div>
          <DirectDonationsTable
            contributions={directAllocationDonationsArray}
          />
        </>
      )}
    </>
  );
}
