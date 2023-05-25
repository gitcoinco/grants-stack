import { useAccount } from "wagmi";

function StatCard(props: { title: string; value: string | undefined }) {
  return <div>{props.title}</div>;
}

export default function ViewContributionHistory() {
  const { address } = useAccount();

  return (
    <div>
      <StatCard title="Address" value={address} />
    </div>
  );
}
