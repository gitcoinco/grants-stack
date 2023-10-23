import { getActiveRounds, getRoundsInApplicationPhase } from "../api/rounds";
import { useDebugMode } from "../api/utils";
import useSWR from "swr";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import RoundCard from "./RoundCard";
import { RoundsFilter } from "./RoundsFilter";

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

const ExploreRoundsPage = () => {
  const { data: activeRounds } = useActiveRounds();

  // All active rounds
  // Rounds taking applications

  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection title="Rounds ending soon" action={<RoundsFilter />}>
        <div className="grid md:grid-cols-3 gap-x-6">
          {activeRounds?.slice(0, 3).map((round) => (
            <div key={round.id}>
              <RoundCard round={round} />
            </div>
          ))}
        </div>
      </LandingSection>
    </DefaultLayout>
  );
};

export default ExploreRoundsPage;
