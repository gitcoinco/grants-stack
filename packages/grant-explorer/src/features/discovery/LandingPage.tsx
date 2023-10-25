import { useEffect } from "react";
import {
  useActiveRounds,
  usePrefetchRoundsMetadata,
  useRoundsEndingSoon,
  useRoundsTakingApplications,
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
  const roundsTakingApplications = useRoundsTakingApplications();
  const roundsEndingSoon = useRoundsEndingSoon();

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />
      {/* <LandingSection title="Community curation">
        <div className="grid md:grid-cols-3 gap-x-6">
          {mock.collections?.slice(0, 4).map((collection, i) => (
            <div
              key={collection.id}
              className={`${i % 3 === 0 ? "md:col-span-2" : ""}`}
            >
              <CollectionCard collection={collection} />
            </div>
          ))}
        </div>
      </LandingSection> */}
      <LandingSection
        title="Donate now"
        action={<ViewAllLink to="#">View all</ViewAllLink>}
      >
        <div className="grid md:grid-cols-3 gap-x-6">
          {activeRounds.data?.slice(0, 4).map((round, i) => (
            <div
              key={round.id}
              className={`${i % 3 === 0 ? "md:col-span-2" : ""}`}
            >
              <RoundCard round={round} />
            </div>
          ))}
        </div>
      </LandingSection>
      <LandingSection
        title="Apply for funding"
        action={<ViewAllLink to="/rounds?status=apply">View all</ViewAllLink>}
      >
        <div className="flex gap-8 items-center">
          <div className="hidden md:block w-1/3 space-y-8">
            <p className="text-lg">
              Bring your project to life with Gitcoin's vibrant ecosystem of
              public goods funding opportunities.
            </p>
            <p className="text-lg">
              Discover new grant rounds currently accepting applications, and
              apply for funding today!
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-6 md:w-2/3">
            {roundsTakingApplications.data?.slice(0, 4)?.map((round) => (
              <div key={round.id}>
                <RoundCard round={round} />
              </div>
            ))}
          </div>
        </div>
      </LandingSection>
      <LandingSection
        title="Rounds ending soon"
        action={<ViewAllLink to="#">View all</ViewAllLink>}
      >
        <div className="grid md:grid-cols-3 gap-x-6">
          {roundsEndingSoon.data?.map((round) => (
            <div key={round.id}>
              <RoundCard round={round} />
            </div>
          ))}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default LandingPage;
