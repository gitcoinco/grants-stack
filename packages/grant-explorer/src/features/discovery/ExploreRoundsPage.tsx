import { useFilterRounds, usePrefetchRoundsMetadata } from "../api/rounds";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import RoundCard from "./RoundCard";
import { RoundsFilter } from "./RoundsFilter";
import { FilterProps, FilterStatus, getLabel } from "./FilterDropdown";
import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE } from "common";
import { useSearchParams } from "react-router-dom";

const pageTitles = {
  "": "All active rounds",
  [ROUND_PAYOUT_MERKLE]: "Quadratic Funding rounds",
  [ROUND_PAYOUT_DIRECT]: "Direct Grants rounds",
  [FilterStatus.taking_applications]: "Rounds taking applications",
  [FilterStatus.finished]: "Rounds finished",
};

function getSectionTitle(filter: FilterProps) {
  const title = getLabel(filter);
  return pageTitles[title.value as keyof typeof pageTitles] ?? title.label;
}
const ExploreRoundsPage = () => {
  usePrefetchRoundsMetadata();
  const [params] = useSearchParams();
  const { type, status, network } = Object.fromEntries(params) as FilterProps;

  // TODO: pass the filter from the search params and build the graphql query
  const rounds = useFilterRounds();

  const sectionTitle = getSectionTitle({ type, status, network });
  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={`${sectionTitle} (${rounds.data?.length ?? 0})`}
        className="flex-wrap"
        action={<RoundsFilter />}
      >
        <div className="grid md:grid-cols-3 gap-x-6">
          {rounds.data?.map((round) => (
            <div key={round.id}>
              <RoundCard round={round} />
            </div>
          ))}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default ExploreRoundsPage;
