import { useEffect } from "react";
import {
  RoundOverview,
  useActiveRounds,
  usePrefetchRoundsMetadata,
  // useRoundsEndingSoon,
} from "../api/rounds";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection, ViewAllLink } from "./LandingSection";
import RoundCard from "./RoundCard";
import { useLocation } from "react-router-dom";

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

  usePrefetchRoundsMetadata();

  const activeRounds = useActiveRounds();
  // const roundsEndingSoon = useRoundsEndingSoon();

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />
      <LandingSection
        title="Donate now"
        action={<ViewAllLink to="#">View all</ViewAllLink>}
      >
        <div className="grid md:grid-cols-3 gap-x-6">
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
        <div className="grid md:grid-cols-3 gap-x-6">
          {(activeRounds.data ?? createRoundLoadingData(6))?.map((round, i) => (
            <div key={round?.id ?? i}>
              <RoundCard round={round} isLoading={activeRounds.isLoading} />
            </div>
          ))}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

function createRoundLoadingData(length = 4): RoundOverview[] {
  return Array.from({ length }).map((_, i) => ({
    id: String(i),
    chainId: "1",
    roundMetaPtr: {
      protocol: 1,
      pointer: "",
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: "",
    },
    applicationsStartTime: "0",
    applicationsEndTime: "0",
    roundStartTime: "0",
    roundEndTime: "0",
    matchAmount: "",
    token: "0",
    payoutStrategy: {
      id: "someid",
      strategyName: "MERKLE",
    },
  }));
}

export default LandingPage;
