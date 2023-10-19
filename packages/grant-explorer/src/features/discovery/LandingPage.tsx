import { useState, useEffect } from "react";
import {
  getActiveRounds,
  getRoundsInApplicationPhase,
  RoundOverview,
} from "../api/rounds";
import { useDebugMode } from "../api/utils";
import ActiveRoundsSection from "./ActiveRoundSection";
import ApplyNowSection from "./ApplyNowSection";
import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE } from "../../constants";
import useSWR, { mutate } from "swr";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection, ViewAllLink } from "./LandingSection";
import RoundCard from "./RoundCard";
import { mock } from "../../mock/rounds";

export function useActiveRounds() {
  const debugModeEnabled = useDebugMode();
  return useSWR(`activeRounds`, () => getActiveRounds(debugModeEnabled));
}

export function useRoundsInApplicationPhase() {
  const debugModeEnabled = useDebugMode();
  return useSWR(`applicationRounds`, () =>
    getRoundsInApplicationPhase(debugModeEnabled)
  );
}

const LandingPage = () => {
  useEffect(() => {
    if (process.env.REACT_APP_ENV === "production") {
      window.location.replace("https://grants.gitcoin.co");
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const { isLoading: activeRoundsLoading, data: activeRounds } =
    useActiveRounds();

  const { isLoading: applyRoundsLoading, data: roundsInApplicationPhase } =
    useRoundsInApplicationPhase();

  const [type, setType] = useState<string>("round_type_all");
  const [allActiveRounds, setAllActiveRounds] = useState<RoundOverview[]>([]);

  useEffect(() => {
    if (activeRounds) {
      setAllActiveRounds(activeRounds);
    }
  }, [activeRounds]);

  useEffect(() => {
    if (type) {
      filterGrantRoundByType();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const filterGrantRoundByType = () => {
    const getGrantRoundType = (type: string) => {
      return type === "round_type_direct"
        ? ROUND_PAYOUT_DIRECT
        : ROUND_PAYOUT_MERKLE;
    };
    if (type === "round_type_all") {
      mutate("activeRounds", allActiveRounds, false);
    }
    if (type !== "round_type_all") {
      const filterType = getGrantRoundType(type);
      const filteredRounds = allActiveRounds.filter((round: RoundOverview) => {
        return (
          round.payoutStrategy &&
          round.payoutStrategy.strategyName === filterType
        );
      });
      mutate("activeRounds", filteredRounds, false);
      if (searchQuery) setSearchQuery("");
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const timeOutId = setTimeout(
        () => filterProjectsByTitle(activeRounds ?? [], searchQuery),
        300
      );
      return () => clearTimeout(timeOutId);
    } else {
      filterGrantRoundByType();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />
      <LandingSection title="Community curation">
        Community curation
      </LandingSection>
      <LandingSection
        title="Donate now"
        action={<ViewAllLink to="#">View all</ViewAllLink>}
      >
        <div className="grid grid-cols-3 gap-x-6">
          {mock.rounds?.slice(0, 4).map((round, i) => (
            <div
              key={round.id}
              className={`${i % 3 === 0 ? "col-span-2" : ""}`}
            >
              <RoundCard round={round} />
            </div>
          ))}
        </div>
      </LandingSection>
      <LandingSection
        title="Apply for funding"
        action={<ViewAllLink to="/apply-now">View all</ViewAllLink>}
      >
        <div className="flex gap-8 items-center">
          <div className="w-1/3 space-y-8">
            <p className="text-lg">
              Bring your project to life with Gitcoin's vibrant ecosystem of
              public goods funding opportunities.
            </p>
            <p className="text-lg">
              Discover new grant rounds currently accepting applications, and
              apply for funding today!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 w-2/3">
            {mock.rounds?.slice(0, 4).map((round) => (
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
        <div className="grid grid-cols-3 gap-x-6">
          {mock.rounds?.slice(0, 3).map((round) => (
            <div key={round.id}>
              <RoundCard round={round} />
            </div>
          ))}
        </div>
      </LandingSection>

      <div className="container px-4 md:px-0 md:mx-auto">
        <h1 className="text-3xl mt-11 mb-10 border-b-2 pb-4">
          Browse through active rounds
        </h1>
        <ApplyNowSection
          isLoading={applyRoundsLoading}
          roundOverview={roundsInApplicationPhase}
        />
        <ActiveRoundsSection
          isLoading={activeRoundsLoading}
          setSearchQuery={setSearchQuery}
          setRoundType={setType}
          roundOverview={filterProjectsByTitle(activeRounds ?? [], searchQuery)}
          searchQuery={searchQuery}
        />
      </div>
    </DefaultLayout>
  );
};

const filterProjectsByTitle = (rounds: RoundOverview[], query: string) => {
  // filter by exact title matches first
  // e.g if searchString is "ether" then "ether grant" comes before "ethereum grant"

  if (query.trim() === "") {
    return rounds;
  }

  const exactMatches = rounds.filter(
    (round) =>
      round.roundMetadata?.name?.toLocaleLowerCase() ===
      query.toLocaleLowerCase()
  );

  const nonExactMatches = rounds.filter(
    (round) =>
      round.roundMetadata?.name
        ?.toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()) &&
      round.roundMetadata?.name?.toLocaleLowerCase() !==
        query.toLocaleLowerCase()
  );

  return [...exactMatches, ...nonExactMatches];
};

export default LandingPage;
