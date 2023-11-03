import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import RoundCard from "./RoundCard";
import { RoundsFilter } from "./RoundsFilter";
import { useSearchParams } from "react-router-dom";
import { parseFilterParams, useFilterRounds } from "./hooks/useFilterRounds";
import { createRoundLoadingData } from "./utils/createRoundLoadingData";
import { getExplorerPageTitle } from "./utils/getExplorerPageTitle";

const ExploreRoundsPage = () => {
  const [params] = useSearchParams();
  const filter = parseFilterParams(params);

  // Pass the filter from the search params and build the graphql query
  const rounds = useFilterRounds(filter);

  const sectionTitle = getExplorerPageTitle(filter);

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={`${sectionTitle} (${rounds.data?.length ?? 0})`}
        className="flex-wrap"
        action={<RoundsFilter />}
      >
        <div className="grid md:grid-cols-3 gap-6">
          {(rounds.data ?? createRoundLoadingData(6))?.map((round) => (
            <div key={round.id}>
              <RoundCard round={round} isLoading={rounds.isLoading} />
            </div>
          ))}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default ExploreRoundsPage;
