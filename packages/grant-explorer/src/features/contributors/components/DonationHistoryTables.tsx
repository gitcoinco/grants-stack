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
    <div className="flex flex-col gap-12">
      <DonationsTable
        title="Active Rounds"
        contributions={activeRoundDonations}
      />
      <DonationsTable title="Past Rounds" contributions={pastRoundDonations} />
      {directAllocationDonationsArray.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center h-[45px] border-black text-black text-lg/[26px] border-b font-modern-era-medium font-medium">
            Direct Donations
          </div>
          <DirectDonationsTable
            contributions={directAllocationDonationsArray}
          />
        </div>
      )}
    </div>
  );
}
