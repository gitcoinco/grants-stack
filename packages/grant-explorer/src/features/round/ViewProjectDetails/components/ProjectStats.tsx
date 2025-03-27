import { Stat } from "./Stat";
import { formatDistanceToNowStrict } from "date-fns";
import { Application } from "data-layer";
import { useProjectDetailsParams } from "../hooks/useProjectDetailsParams";
import { useRoundById } from "../../../../context/RoundContext";
import { isInfiniteDate } from "../../../api/utils";

export function ProjectStats(props: { application: Application | undefined }) {
  const { chainId, roundId } = useProjectDetailsParams();
  const { round } = useRoundById(Number(chainId), roundId);
  const application = props.application;

  const timeRemaining =
    round?.roundEndTime && !isInfiniteDate(round?.roundEndTime)
      ? formatDistanceToNowStrict(round.roundEndTime)
      : null;
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime) || round.roundEndTime > new Date());

  return (
    <div className="rounded-3xl flex-auto p-3 md:p-4 gap-4 flex flex-col text-blue-800">
      <Stat
        isLoading={!application}
        value={`$${application?.totalAmountDonatedInUsd.toFixed(2)}`}
      >
        funding received in current round
      </Stat>
      <Stat isLoading={!application} value={application?.uniqueDonorsCount}>
        contributors
      </Stat>

      <Stat
        isLoading={isBeforeRoundEndDate === undefined}
        value={timeRemaining}
        className={
          // Explicitly check for true - could be undefined if round hasn't been loaded yet
          isBeforeRoundEndDate === true || isBeforeRoundEndDate === undefined
            ? ""
            : "flex-col-reverse"
        }
      >
        {
          // If loading - render empty
          isBeforeRoundEndDate === undefined
            ? ""
            : isBeforeRoundEndDate
              ? "to go"
              : "Round ended"
        }
      </Stat>
    </div>
  );
}
