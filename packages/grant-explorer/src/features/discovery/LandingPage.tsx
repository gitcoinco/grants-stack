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
// Note: use during grants rounds or when we figure out how to use all the time.
import { useCollections } from "../collections/hooks/useCollections";
import { CollectionsGrid } from "../collections/CollectionsGrid";

const LandingPage = () => {
  const activeRounds = useFilterRounds(
    ACTIVE_ROUNDS_FILTER,
    getEnabledChains(),
    true
  );
  const roundsEndingSoon = useFilterRounds(
    ROUNDS_ENDING_SOON_FILTER,
    getEnabledChains(),
    true
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

  const collections = useCollections();

  return (
    <GradientLayout showWalletInteraction showAlloVersionBanner={false}>
      <LandingHero />

      <LandingSection title="Community collections">
        {collections.data !== undefined && (
          <CollectionsGrid data={collections.data} />
        )}
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
              status: `${RoundStatus.active},verified`,
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
