import { ContributorProfile } from "./ContributorProfile";
import { UnknownOrNoContributions } from "./UnknownOrNoContributions";

export function ContributionHistoryError({
  address,
  ensName,
}: {
  address: string;
  ensName?: string | null;
}) {
  return (
    <main>
      <ContributorProfile address={address} ensName={ensName} />
      <UnknownOrNoContributions address={address} ensName={ensName} />
    </main>
  );
}
