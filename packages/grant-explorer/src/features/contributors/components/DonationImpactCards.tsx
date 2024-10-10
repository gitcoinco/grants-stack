import { StatCard } from "../../common/StatCard";

export function DonationImpactCards({
  totals = {
    totalDonations: 0,
    totalUniqueContributions: 0,
    totalProjectsFunded: 0,
  },
}: {
  totals?: {
    totalDonations: number;
    totalUniqueContributions: number;
    totalProjectsFunded: number;
  };
}) {
  const totalDonations = totals.totalDonations.toFixed(2).toString();
  const totalUniqueContributions = totals.totalUniqueContributions.toString();
  const totalProjectsFunded = totals.totalProjectsFunded.toString();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-sans">Donation Impact</div>
      <div className="grid grid-cols-2 grid-row-2 lg:grid-cols-3 lg:grid-row-1 gap-6">
        <div className="col-span-2 lg:col-span-1">
          <StatCard title="Total Donations" value={"$" + totalDonations} />
        </div>
        <div className="col-span-1">
          <StatCard title="Contributions" value={totalUniqueContributions} />
        </div>
        <div className="col-span-1">
          <StatCard title="Projects Funded" value={totalProjectsFunded} />
        </div>
      </div>
    </div>
  );
}
