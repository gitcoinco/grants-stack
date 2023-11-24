import { formatDistanceToNowStrict } from "date-fns";
import { ComponentProps } from "react";
import { useRoundById } from "../../context/RoundContext";
import { Skeleton } from "@chakra-ui/react";
import { isInfiniteDate } from "../api/utils";
import { useRoundApprovedApplication } from "./hooks/useRoundApprovedApplication";

type Props = { chainId?: string; roundId?: string; applicationId?: string };

export function ProjectStats({ chainId, roundId, applicationId }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(chainId!, roundId!);

  const projectToRender = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );

  const { data: application } = useRoundApprovedApplication(
    Number(chainId),
    roundId as string,
    projectToRender?.projectRegistryId as string
  );

  const timeRemaining =
    round?.roundEndTime && !isInfiniteDate(round?.roundEndTime)
      ? formatDistanceToNowStrict(round.roundEndTime)
      : null;
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(round.roundEndTime) || round.roundEndTime > new Date());

  return (
    <div
      className={
        "rounded-3xl bg-gray-50 mb-4 p-4 gap-4 grid grid-cols-3 md:flex md:flex-col"
      }
    >
      <Stat
        isLoading={!application}
        value={`$${application?.amountUSD.toFixed(2)}`}
      >
        funding received in current round
      </Stat>
      <Stat isLoading={!application} value={application?.uniqueContributors}>
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

function Stat({
  value,
  children,
  isLoading,
  className,
}: {
  value?: string | number | null;
  isLoading?: boolean;
} & ComponentProps<"div">) {
  return (
    <div className={`flex flex-col ${className}`}>
      <Skeleton isLoaded={!isLoading} height={"36px"}>
        <h4 className="text-3xl">{value}</h4>
      </Skeleton>
      <span className="text-sm md:text-base">{children}</span>
    </div>
  );
}
