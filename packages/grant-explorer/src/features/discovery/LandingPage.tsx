import { useEffect } from "react";
import { useActiveRounds, useRoundsEndingSoon } from "../api/rounds";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection, ViewAllLink } from "./LandingSection";
import RoundCard from "./RoundCard";
import { useLocation } from "react-router-dom";
import { createRoundLoadingData } from "./utils/createRoundLoadingData";

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

  console.log("ending soon", roundsEndingSoon.data);
  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />
      <LandingSection
        title="Donate now"
        action={<ViewAllLink to="#">View all</ViewAllLink>}
      >
        <div className="grid md:grid-cols-3 gap-6">
          {(activeRounds.data ?? createRoundLoadingData(6))
            ?.slice(0, 6)
            .map((round, i) => (
              <div
                key={round?.id}
                className={`${i % 3 && i % 4 ? "" : "md:col-span-2"}`}
              >
                <RoundCard round={round} isLoading={activeRounds.isLoading} />
              </div>
            ))}
        </div>
      </LandingSection>
      <LandingSection
        title="Rounds ending soon"
        action={<ViewAllLink to="#">View all</ViewAllLink>}
      >
        <div className="grid md:grid-cols-3 gap-6">
          {(roundsEndingSoon.data ?? createRoundLoadingData(3))?.map(
            (round, i) => (
              <div key={round?.id ?? i}>
                <RoundCard
                  round={round}
                  isLoading={roundsEndingSoon.isLoading}
                />
              </div>
            )
          )}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default LandingPage;
