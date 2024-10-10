import { ContributorProfile } from "./ContributorProfile";
import { DonationImpactCards } from "./DonationImpactCards";
import { DonationsHistory } from "./DonationsHistory";

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <ContributorProfile address={address} ensName={ensName} />
          <div className="text-sm text-gray-500">
            Please note that your recent transactions may take a short while to
            reflect in your donation history, as processing times may vary.
          </div>
        </div>
        <DonationImpactCards totals={totals} />
        <div className="text-2xl">Donation History</div>
        <DonationsHistory contributionsData={contributionsData} />
      </div>
    </main>
  );
}
