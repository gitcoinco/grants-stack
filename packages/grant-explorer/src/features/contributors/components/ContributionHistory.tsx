import { ContributorProfile } from "./ContributorProfile";
import { DonationImpactCards } from "./DonationImpactCards";
import { DonationHistoryTables } from "./DonationHistoryTables";
import { UnknownOrNoContributions } from "./UnknownOrNoContributions";

import type { ContributionsData } from "../types";

export function ContributionHistory({
  contributionsData,
  address,
  ensName,
}: {
  contributionsData?: ContributionsData;
  address: string;
  ensName?: string | null;
}) {
  const totals = contributionsData?.totals;

  return (
    <main>
      <ContributorProfile address={address} ensName={ensName} />
      <div className="text-sm text-gray-500 mb-4">
        Please note that your recent transactions may take a short while to
        reflect in your donation history, as processing times may vary.
      </div>
      <DonationImpactCards totals={totals} />
      <DonationHistoryTables contributionsData={contributionsData} />
    </main>
  );
}
