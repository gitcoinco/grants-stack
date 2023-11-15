import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection, ViewAllLink } from "./LandingSection";
import { RoundsGrid } from "./RoundsGrid";
import {
  FilterStatus,
  activeFilter,
  endingSoonFilter,
  useFilterRounds,
} from "./hooks/useFilterRounds";
import { toQueryString } from "./RoundsFilter";
import { CategoriesGrid } from "../categories/CategoriesGrid";
import { useCategories } from "../categories/hooks/useCategories";
import { CollectionsGrid } from "../collections/CollectionsGrid";
import { useCollections } from "../collections/hooks/useCollections";

const LandingPage = () => {
  const activeRounds = useFilterRounds(activeFilter);
  const roundsEndingSoon = useFilterRounds(endingSoonFilter);

  const categories = useCategories();
  const collections = useCollections();

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />
      <LandingSection title="Community collections">
        <CollectionsGrid data={collections} />
      </LandingSection>
      <LandingSection title="Categories">
        <CategoriesGrid data={categories} loadingCount={4} maxCount={4} />
      </LandingSection>
      <LandingSection
        title="Donate now"
        action={
          <ViewAllLink to={`/rounds?${toQueryString(activeFilter)}`}>
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
              orderBy: endingSoonFilter.orderBy,
              orderDirection: endingSoonFilter.orderDirection,
              status: FilterStatus.active,
            })}`}
          >
            View all
          </ViewAllLink>
        }
      >
        <RoundsGrid
          {...roundsEndingSoon}
          loadingCount={endingSoonFilter.first}
          maxCount={endingSoonFilter.first}
          roundType="endingSoon"
        />
      </LandingSection>
    </DefaultLayout>
  );
};

export default LandingPage;
