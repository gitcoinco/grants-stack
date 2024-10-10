import { Contribution } from "data-layer";

import { DirectDonationsHeader } from "./DirectDonationsHeader";
import { DirectDonationsList } from "./DirectDonationsList";

export function DirectDonations(props: { contributions: Contribution[] }) {
  return (
    <div className="flex flex-col gap-6">
      <DirectDonationsHeader />
      <DirectDonationsList contributions={props.contributions} />
    </div>
  );
}
