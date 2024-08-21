import ExploreProjects from "@/features/projects/components/ExploreProjects";
import ExploreRounds from "@/features/rounds/components/ExploreRounds";
import { DiscoverRounds, RoundsQuery } from "@allo-team/kit";

interface Params {
  chainId: string;
  roundId: string;
  applicationId: string;
}

const query: RoundsQuery = {
  where: { chainId: { equalTo: 8453 } },
  orderBy: { match_amount_in_usd: "desc" },
  first: 10,
};

export default function Rounds({ params }: { params: Params }) {
  return (
    <main className="">
      <ExploreRounds query={query} />
    </main>
  );
}
