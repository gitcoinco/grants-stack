import { datadogLogs } from "@datadog/browser-logs";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useRoundById } from "../../../context/RoundContext";
import { isDirectRound, isInfiniteDate } from "../../api/utils";

import NotFoundPage from "../../common/NotFoundPage";
import { Spinner } from "../../common/Spinner";

import { getAlloVersion } from "common/src/config";

import { RoundPage } from "./RoundPage";

export default function ViewRound() {
  datadogLogs.logger.info("====> Route: /round/:chainId/:roundId");
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const { chainId, roundId } = useParams();

  const { round, isLoading } = useRoundById(
    Number(chainId),
    roundId?.toLowerCase() as string
  );

  const currentTime = new Date();
  const isBeforeRoundStartDate =
    round &&
    (isDirectRound(round)
      ? round.applicationsStartTime
      : round.roundStartTime) >= currentTime;
  const isAfterRoundStartDate =
    round &&
    (isDirectRound(round)
      ? round.applicationsStartTime
      : round.roundStartTime) <= currentTime;
  // covers infinte dates for roundEndDate
  const isAfterRoundEndDate =
    round &&
    (isInfiniteDate(
      isDirectRound(round) ? round.applicationsEndTime : round.roundEndTime
    )
      ? false
      : round &&
        (isDirectRound(round)
          ? round.applicationsEndTime
          : round.roundEndTime) <= currentTime);
  const isBeforeRoundEndDate =
    round &&
    (isInfiniteDate(
      isDirectRound(round) ? round.applicationsEndTime : round.roundEndTime
    ) ||
      (isDirectRound(round) ? round.applicationsEndTime : round.roundEndTime) >
        currentTime);

  const alloVersion = getAlloVersion();

  useEffect(() => {
    if (
      isAfterRoundEndDate !== undefined &&
      roundId?.startsWith("0x") &&
      alloVersion === "allo-v2" &&
      !isAfterRoundEndDate
    ) {
      window.location.href = `https://explorer-v1.gitcoin.co${window.location.pathname}${window.location.hash}`;
    }
  }, [roundId, alloVersion, isAfterRoundEndDate]);

  return isLoading ? (
    <Spinner text="We're fetching the Round." />
  ) : (
    <>
      {round && chainId && roundId ? (
        <RoundPage
          round={round}
          chainId={Number(chainId)}
          roundId={roundId}
          isBeforeRoundStartDate={isBeforeRoundStartDate}
          isAfterRoundStartDate={isAfterRoundStartDate}
          isBeforeRoundEndDate={isBeforeRoundEndDate}
          isAfterRoundEndDate={isAfterRoundEndDate}
        />
      ) : (
        <NotFoundPage />
      )}
    </>
  );
}
