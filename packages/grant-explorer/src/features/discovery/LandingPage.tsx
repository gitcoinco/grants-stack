import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection, ViewAllLink } from "./LandingSection";
import { RoundsGrid } from "./RoundsGrid";
import { useFilterRounds } from "./hooks/useFilterRounds";
import { toQueryString } from "./RoundsFilter";

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

  const activeFilter = {
    orderBy: "matchAmount",
    orderDirection: "desc",
    status: "active",
    type: "MERKLE",
    network: "",
  } as const;

  const endingSoonFilter = {
    first: 3,
    orderBy: "roundEndTime",
    orderDirection: "asc",
    type: "",
    network: "",
    status: "ending_soon",
  } as const;

  const activeRounds = useFilterRounds(activeFilter);
  const roundsEndingSoon = useFilterRounds(endingSoonFilter);

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />
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
          itemClassName={(_, i) => `${i % 3 && i % 4 ? "" : "md:col-span-2"}`}
        />
      </LandingSection>
      <LandingSection
        title="Rounds ending soon"
        action={
          <ViewAllLink to={`/rounds?${toQueryString(activeFilter)}`}>
            View all
          </ViewAllLink>
        }
      >
        <RoundsGrid
          {...roundsEndingSoon}
          loadingCount={endingSoonFilter.first}
          maxCount={endingSoonFilter.first}
        />
      </LandingSection>
    </DefaultLayout>
  );
};

export default LandingPage;
