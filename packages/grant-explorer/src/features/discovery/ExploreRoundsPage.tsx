import { getActiveRounds, getRoundsInApplicationPhase } from "../api/rounds";
import { useDebugMode } from "../api/utils";
import useSWR from "swr";
import { DefaultLayout } from "../common/DefaultLayout";
import LandingHero from "./LandingHero";
import { LandingSection } from "./LandingSection";
import RoundCard from "./RoundCard";
import { RoundsFilter } from "./RoundsFilter";
import { FilterProps, FilterStatus, getLabel } from "./FilterDropdown";
import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE } from "common";
import { useSearchParams } from "react-router-dom";

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

const pageTitles = {
  "": "All active rounds",
  [ROUND_PAYOUT_MERKLE]: "Quadratic Funding rounds",
  [ROUND_PAYOUT_DIRECT]: "Direct Grants rounds",
  [FilterStatus.apply]: "Rounds taking applications",
  [FilterStatus.finished]: "Rounds finished",
};

function getSectionTitle(filter: FilterProps) {
  const title = getLabel(filter);
  return pageTitles[title.value as keyof typeof pageTitles] ?? title.label;
}
const ExploreRoundsPage = () => {
  const [params] = useSearchParams();
  const { data: activeRounds } = useActiveRounds();
  const { type, status, network } = Object.fromEntries(params);

  const sectionTitle = getSectionTitle({ type, status, network });
  return (
    <DefaultLayout showWalletInteraction>
      <LandingHero />

      <LandingSection
        title={`${sectionTitle} (${activeRounds?.length ?? 0})`}
        className="flex-wrap"
        action={<RoundsFilter />}
      >
        <div className="grid md:grid-cols-3 gap-x-6">
          {activeRounds?.map((round) => (
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
