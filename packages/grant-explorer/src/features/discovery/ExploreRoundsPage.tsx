import { useSearchParams } from "react-router-dom";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import { parseFilterParams, useFilterRounds } from "./hooks/useFilterRounds";
import { RoundsFilter } from "./RoundsFilter";
import { getExplorerPageTitle } from "./utils/getExplorerPageTitle";
import { RoundsGrid } from "./RoundsGrid";

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
        <RoundsGrid {...rounds} loadingCount={6} />
      </LandingSection>
    </DefaultLayout>
  );
};

export default ExploreRoundsPage;
