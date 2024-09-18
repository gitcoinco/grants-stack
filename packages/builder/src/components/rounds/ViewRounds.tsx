import { DiscoverRounds } from "@allo-team/kit";
import "@allo-team/kit/styles.css";
import { useAccount } from "wagmi";

export default function ViewRounds() {
  const { address } = useAccount();
  console.log("address", address);
  if (!address) return <div>Connect your wallet</div>;
  return (
    <DiscoverRounds
      query={{
        where: {
          // Only rounds where we are admin or manager
          roles: {
            some: {
              address: { in: [address.toLowerCase() as `0x${string}`] },
            },
          },
        },
      }}
      renderItem={(round, Component) => (
        <span key={round.id} aria-label={round.name}>
          <Component
            id={round.id}
            chainId={round.chainId}
            description={round.description}
            phases={round.phases}
            bannerUrl={round.bannerUrl}
            avatarUrl={round.avatarUrl}
            managers={round.managers}
            applications={round.applications}
            eligibility={round.eligibility}
            name={round.name}
            matching={round.matching}
            roles={round.roles}
            strategyName={round.strategyName}
            strategy={round.strategy}
          />
        </span>
      )}
      columns={[1, 2, 3]}
    />
  );
}
