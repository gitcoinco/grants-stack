import RoundCard from "./RoundCard";
import { createRoundLoadingData } from "./utils/createRoundLoadingData";
import { RoundsEmptyState } from "./RoundsEmptyState";
import { RoundGetRound } from "data-layer";

export function RoundsGrid({
  isLoading,
  data,
  loadingCount,
  maxCount,
  getItemClassName,
  roundType,
}: {
  isLoading: boolean;
  data?: RoundGetRound[];
  loadingCount: number;
  maxCount?: number;
  getItemClassName?: (round: RoundGetRound, index: number) => string;
  roundType: "all" | "active" | "endingSoon";
}) {
  if (!isLoading && !data?.length) {
    return <RoundsEmptyState />;
  }
  return (
    <div className="md:grid space-y-4 md:space-y-0 md:grid-cols-3 gap-6">
      {(data && data.length > 0 ? data : createRoundLoadingData(loadingCount))
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
