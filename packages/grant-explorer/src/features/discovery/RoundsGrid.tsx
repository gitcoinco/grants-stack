import { __deprecated_RoundOverview } from "../api/rounds";
import RoundCard from "./RoundCard";
import { createRoundLoadingData } from "./utils/createRoundLoadingData";
import { RoundsEmptyState } from "./RoundsEmptyState";

export function RoundsGrid({
  isLoading,
  data,
  loadingCount,
  maxCount,
  getItemClassName,
  roundType,
}: {
  isLoading: boolean;
  data?: __deprecated_RoundOverview[];
  loadingCount: number;
  maxCount?: number;
  getItemClassName?: (
    round: __deprecated_RoundOverview,
    index: number
  ) => string;
  roundType: "all" | "active" | "endingSoon";
}) {
  if (!isLoading && !data?.length) {
    return <RoundsEmptyState />;
  }
  return (
    <div className="md:grid space-y-4 md:space-y-0 md:grid-cols-3 gap-6">
      {(data ?? createRoundLoadingData(loadingCount))
        ?.slice(0, maxCount)
        .map((round, i) => (
          <div key={round?.id} className={getItemClassName?.(round, i)}>
            <RoundCard
              round={round}
              isLoading={isLoading}
              index={i}
              roundType={roundType}
            />
          </div>
        ))}
    </div>
  );
}
