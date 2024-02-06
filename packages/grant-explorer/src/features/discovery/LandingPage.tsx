import { GradientLayout } from "../common/DefaultLayout";
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
import { getEnabledChains } from "../../app/chainConfig";
import { useMemo } from "react";

const LandingPage = () => {
  const activeRounds = useFilterRounds(
    ACTIVE_ROUNDS_FILTER,
    getEnabledChains()
  );
  const roundsEndingSoon = useFilterRounds(
    ROUNDS_ENDING_SOON_FILTER,
    getEnabledChains()
  );

  const filteredActiveRounds: typeof activeRounds.data = useMemo(() => {
    if (activeRounds.data === undefined) {
      return undefined;
    }

    const rounds =
      activeRounds.data?.filter((round) => {
        return (round.projects?.length ?? 0) > 1;
      }) ?? [];

    rounds.sort((a, b) => {
      return (b.projects?.length ?? 0) - (a.projects?.length ?? 0);
    });

    return rounds;
  }, [activeRounds.data]);

  return (
    <GradientLayout showWalletInteraction>
      <LandingHero />
      <LandingSection
        title="Donate now"
        action={
          <ViewAllLink to={`/rounds?${toQueryString(ACTIVE_ROUNDS_FILTER)}`}>
            View all
          </ViewAllLink>
        }
      >
        <RoundsGrid
          {...{ ...activeRounds, data: filteredActiveRounds }}
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
    </GradientLayout>
  );
};

export default LandingPage;
