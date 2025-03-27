import { useApplication } from "../../../../../projects/hooks/useApplication";
import { useDataLayer } from "data-layer";
import { useEffect, useMemo, useState } from "react";
import { DonationPeriodResult, TimeRemaining } from "../types";
import { calculateDonationPeriod, isValidStringDate } from "../utils";

interface Params {
  chainId: number;
  roundId: string;
  applicationId: string;
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
  applicationId,
  refreshInterval = 5 * 60 * 1000,
}: Params): Result => {
  const dataLayer = useDataLayer();
  const { data: application } = useApplication(
    {
      chainId,
      roundId,
      applicationId,
    },
    dataLayer
  );

  const hasValidDonationDates = useMemo(() => {
    if (!application) return false;
    const { donationsStartTime, donationsEndTime } = application?.round ?? {};
    return (
      isValidStringDate(donationsStartTime) &&
      isValidStringDate(donationsEndTime)
    );
  }, [application]);

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
          application,
          currentTime,
          hasValidDonationDates,
        }),
      [application, currentTime, hasValidDonationDates]
    );
  return { isDonationPeriod, timeToDonationStart, timeToDonationEnd };
};
