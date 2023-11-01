import { usePrefetchRoundsMetadata } from "../api/rounds";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import RoundCard from "./RoundCard";
import { RoundsFilter } from "./RoundsFilter";
import { FilterProps, FilterStatus, getLabel } from "./FilterDropdown";
import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE } from "common";
import { useSearchParams } from "react-router-dom";
import { parseFilterParams, useFilterRounds } from "./hooks/useFilterRounds";
import { createRoundLoadingData } from "./utils/createRoundLoadingData";

function getSectionTitle(filter: FilterProps) {
  const title = getLabel(filter);
  switch (title.value) {
    case "":
      return "All active rounds";
    case ROUND_PAYOUT_MERKLE:
      return "Quadratic Funding rounds";
    case ROUND_PAYOUT_DIRECT:
      return "Direct Grants rounds";
    case FilterStatus.taking_applications:
      return "Rounds taking applications";
    case FilterStatus.finished:
      return "Rounds finished";
    default:
      return title.label;
  }
}

const ExploreRoundsPage = () => {
  usePrefetchRoundsMetadata();
  const [params] = useSearchParams();
  const filter = parseFilterParams(params);

  // Pass the filter from the search params and build the graphql query
  const rounds = useFilterRounds(filter);

  const sectionTitle = getSectionTitle(filter);
  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={`${sectionTitle} (${rounds.data?.length ?? 0})`}
        className="flex-wrap"
        action={<RoundsFilter />}
      >
        <div className="grid md:grid-cols-3 gap-x-6">
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
