import { useEffect, useMemo, useState } from "react";
import { DonationPeriodResult, TimeRemaining } from "../types";
import { calculateDonationPeriod, isValidStringDate } from "../utils";
import { useRoundById } from "../../../../../../context/RoundContext";

interface Params {
  chainId: number;
  roundId: string;
  refreshInterval?: number;
}

interface Result {
  isDonationPeriod?: boolean;
  timeToDonationStart?: TimeRemaining;
  timeToDonationEnd?: TimeRemaining;
}

// Returns undefined if the application is not stakable or if the donation period is not valid
export const useDonationPeriod = ({
  chainId,
  roundId,
  refreshInterval = 5 * 60 * 1000,
}: Params): Result => {
  const { round } = useRoundById(chainId, roundId);

  const hasValidDonationDates = useMemo(() => {
    if (!round) return false;
    const {
      roundStartTime: donationsStartTime,
      roundEndTime: donationsEndTime,
    } = round;
    return (
      isValidStringDate(donationsStartTime.toISOString()) &&
      isValidStringDate(donationsEndTime.toISOString())
    );
  }, [round]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasValidDonationDates) setCurrentTime(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [hasValidDonationDates, refreshInterval]);

  const { isDonationPeriod, timeToDonationStart, timeToDonationEnd } =
    useMemo<DonationPeriodResult>(
      () =>
        calculateDonationPeriod({
          roundDonationPeriod: {
            roundStartTime: round?.roundStartTime.toISOString() ?? "",
            roundEndTime: round?.roundEndTime.toISOString() ?? "",
          },
          currentTime,
          hasValidDonationDates,
        }),
      [round, currentTime, hasValidDonationDates]
    );
  return { isDonationPeriod, timeToDonationStart, timeToDonationEnd };
};
