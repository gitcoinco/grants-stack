import { RoundOverview } from "../api/rounds";
import RoundCard from "./RoundCard";
import { createRoundLoadingData } from "./utils/createRoundLoadingData";
import { RoundsEmptyState } from "./RoundsEmptyState";

export function RoundsGrid({
  isLoading,
  data,
  loadingCount,
  maxCount,
  itemClassName,
}: {
  isLoading: boolean;
  data?: RoundOverview[];
  loadingCount: number;
  maxCount?: number;
  itemClassName?: (round: RoundOverview, index: number) => string;
}) {
  if (!isLoading && !data?.length) {
    return <RoundsEmptyState />;
  }
  if (!isLoading && !data?.length) {
    return <RoundsEmptyState />;
  }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {(data ?? createRoundLoadingData(loadingCount))
        ?.slice(0, maxCount)
        .map((round, i) => (
          <div key={round?.id} className={itemClassName?.(round, i)}>
            <RoundCard round={round} isLoading={isLoading} />
          </div>
        ))}
    </div>
  );
}
