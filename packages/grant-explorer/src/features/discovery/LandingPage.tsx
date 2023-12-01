import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection, ViewAllLink } from "./LandingSection";
import { RoundsGrid } from "./RoundsGrid";
import {
  RoundStatus,
  ACTIVE_ROUNDS_FILTER,
  ROUNDS_ENDING_SOON_FILTER,
  useFilterRounds,
} from "./hooks/useFilterRounds";
import { toQueryString } from "./RoundsFilter";
import { CategoriesGrid } from "../categories/CategoriesGrid";
import { useCategories } from "../categories/hooks/useCategories";
import { CollectionsGrid } from "../collections/CollectionsGrid";
import { useCollections } from "../collections/hooks/useCollections";
import { Button } from "../collections/CollectionDetails";
import { PresentationChartLineIcon } from "@heroicons/react/20/solid";
import { getEnabledChains } from "../../app/chainConfig";

const LiveStatsButton = () => (
  <div className="absolute right-4 pt-4">
    <Button
      variant="translucent"
      $as="a"
      href="https://gitcoin-grants-51f2c0c12a8e.herokuapp.com"
      target="_blank"
    >
      <PresentationChartLineIcon className="w-4 h-4" />
      Live GG19 stats
    </Button>
  </div>
);

const LandingPage = () => {
  const activeRounds = useFilterRounds(
    ACTIVE_ROUNDS_FILTER,
    getEnabledChains()
  );
  const roundsEndingSoon = useFilterRounds(
    ROUNDS_ENDING_SOON_FILTER,
    getEnabledChains()
  );

  const categories = useCategories();
  const collections = useCollections();

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />
      <LiveStatsButton />
      <LandingSection title="Community collections">
        <CollectionsGrid data={collections} />
      </LandingSection>
      <LandingSection title="Categories">
        <CategoriesGrid data={categories} loadingCount={4} maxCount={4} />
      </LandingSection>
      <LandingSection
        title="Donate now"
        action={
          <ViewAllLink to={`/rounds?${toQueryString(ACTIVE_ROUNDS_FILTER)}`}>
            View all
          </ViewAllLink>
        }
      >
        <RoundsGrid
          {...activeRounds}
          loadingCount={4}
          maxCount={6}
          getItemClassName={(_, i) =>
            `${i % 3 && i % 4 ? "" : "md:col-span-2"}`
          }
          roundType="active"
        />
      </LandingSection>
      <LandingSection
        title="Rounds ending soon"
        action={
          <ViewAllLink
            to={`/rounds?${toQueryString({
              orderBy: ROUNDS_ENDING_SOON_FILTER.orderBy,
              orderDirection: ROUNDS_ENDING_SOON_FILTER.orderDirection,
              status: RoundStatus.active,
            })}`}
          >
            View all
          </ViewAllLink>
        }
      >
        <RoundsGrid
          {...roundsEndingSoon}
          loadingCount={ROUNDS_ENDING_SOON_FILTER.first}
          maxCount={ROUNDS_ENDING_SOON_FILTER.first}
          roundType="endingSoon"
        />
      </LandingSection>
    </DefaultLayout>
  );
};

export default LandingPage;
