import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useActiveRounds, useRoundsEndingSoon } from "../api/rounds";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection, ViewAllLink } from "./LandingSection";
import { RoundsGrid } from "./RoundsGrid";
import { useCollections } from "../collections/hooks/useCollections";
import { CollectionsGrid } from "../collections/CollectionsGrid";
import { CategoriesGrid } from "../categories/CategoriesGrid";
import { useCategories } from "../categories/hooks/useCategories";

const LandingPage = () => {
  const location = useLocation();
  useEffect(() => {
    if (
      process.env.REACT_APP_ENV === "production" &&
      !location.search.includes("skip_redirect")
    ) {
      window.location.replace("https://grants.gitcoin.co");
    }
  }, [location]);

  const activeRounds = useActiveRounds();
  const roundsEndingSoon = useRoundsEndingSoon();

  const categories = useCategories();
  const collections = useCollections();

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />
      <LandingSection title="Community collections">
        <CollectionsGrid
          data={collections}
          loadingCount={8}
          maxCount={8}
          getItemClassName={(_, i) =>
            `${[0, 1, 6, 7].includes(i) ? "md:col-span-2" : ""}`
          }
        />
      </LandingSection>
      <LandingSection title="Categories">
        <CategoriesGrid data={categories} loadingCount={8} maxCount={8} />
      </LandingSection>
      <LandingSection
        title="Donate now"
        action={
          <ViewAllLink to="/rounds?status=active&type=MERKLE">
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
        />
      </LandingSection>
      <LandingSection
        title="Rounds ending soon"
        action={
          <ViewAllLink to="/rounds?orderBy=roundEndTime&orderDirection=asc&status=ending_soon">
            View all
          </ViewAllLink>
        }
      >
        <RoundsGrid {...roundsEndingSoon} loadingCount={3} maxCount={3} />
      </LandingSection>
    </DefaultLayout>
  );
};

export default LandingPage;
