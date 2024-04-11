import { GradientLayout } from "../common/DefaultLayout";
import {
  ACTIVE_ROUNDS_FILTER,
  ROUNDS_ENDING_SOON_FILTER,
  RoundStatus,
  useFilterRounds,
} from "./hooks/useFilterRounds";
import { getEnabledChains } from "../../app/chainConfig";
import { useMemo } from "react";
import {
  filterOutPrivateRounds,
  filterRoundsWithProjects,
} from "../api/rounds";
import { RoundsGrid } from "./RoundsGrid";
import LandingHero from "./LandingHero";
import { LandingSection, ViewAllLink } from "./LandingSection";
import { toQueryString } from "./RoundsFilter";
import { RoundGetRound } from "data-layer";

// note: Add fetured rounds here.
const FEATURED_ROUNDS_IDS = [
  // Gitcoin Citizens Retro Round 3
  "0x5aa255d5cae9b6ce0f2d9aee209cb02349b83731",
  // Uniswap-Arbitrum Grant Program (UAGP)
  "0x6142eedc06d80f3b362ce43b4ac52fad679dc850",
];

const LandingPage = () => {
  const activeRounds = useFilterRounds(
    ACTIVE_ROUNDS_FILTER,
    getEnabledChains()
  );

  const roundsEndingSoon = useFilterRounds(
    ROUNDS_ENDING_SOON_FILTER,
    getEnabledChains()
  );

  const filteredActiveRounds = useMemo(() => {
    return filterRoundsWithProjects(
      filterOutPrivateRounds(activeRounds.data ?? [])
    );
  }, [activeRounds.data]);

  const filteredRoundsEndingSoon = useMemo(() => {
    return filterRoundsWithProjects(
      filterOutPrivateRounds(roundsEndingSoon.data ?? [])
    );
  }, [roundsEndingSoon.data]);

  const featuredRounds = filteredActiveRounds.filter((round: RoundGetRound) => {
    return FEATURED_ROUNDS_IDS.includes(round.id.toLowerCase());
  });

  return (
    <GradientLayout showWalletInteraction showAlloVersionBanner>
      <LandingHero />
      <LandingSection
        title="Featured Rounds"
        action={
          <ViewAllLink to={`/rounds?${toQueryString(ACTIVE_ROUNDS_FILTER)}`}>
            View all
          </ViewAllLink>
        }
      >
        <RoundsGrid
          isLoading={activeRounds.isLoading}
          data={featuredRounds}
          loadingCount={4}
          maxCount={6}
          getItemClassName={(_, i) =>
            `${i % 3 && i % 4 ? "" : "md:col-span-2"}`
          }
          roundType="active"
        />
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
          {...{
            ...activeRounds,
            data: filteredActiveRounds.sort(
              (a, b) => b.matchAmountInUsd - a.matchAmountInUsd
            ),
          }}
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
              status: RoundStatus.active,
            })}`}
          >
            View all
          </ViewAllLink>
        }
      >
        <RoundsGrid
          isLoading={roundsEndingSoon.isLoading}
          data={filteredRoundsEndingSoon}
          loadingCount={ROUNDS_ENDING_SOON_FILTER.first}
          maxCount={ROUNDS_ENDING_SOON_FILTER.first}
          roundType="endingSoon"
        />
      </LandingSection>
    </GradientLayout>
  );
};

export default LandingPage;
