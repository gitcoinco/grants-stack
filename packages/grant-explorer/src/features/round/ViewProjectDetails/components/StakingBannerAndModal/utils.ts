import { isInfiniteDate } from "common";
import { DonationPeriodResult, TimeRemaining } from "./types";

export const isValidStringDate = (date?: string): boolean => {
  return !!date && !isInfiniteDate(new Date(date));
};

export const calculateTimeRemaining = (
  targetDate: Date,
  currentTime: Date
): TimeRemaining => {
  const difference = targetDate.getTime() - currentTime.getTime();
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    totalMilliseconds: difference,
  };
};

interface RoundDonationPeriod {
  roundStartTime: string;
  roundEndTime: string;
}

export const calculateDonationPeriod = ({
  roundDonationPeriod,
  currentTime,
  hasValidDonationDates,
}: {
  roundDonationPeriod?: RoundDonationPeriod;
  currentTime: Date;
  hasValidDonationDates: boolean;
}): DonationPeriodResult => {
  const { roundStartTime, roundEndTime } = roundDonationPeriod ?? {};
  if (!hasValidDonationDates || !roundStartTime || !roundEndTime) {
    return {
      isDonationPeriod: undefined,
      timeToDonationStart: undefined,
      timeToDonationEnd: undefined,
    };
  }

  const donationsStartTimeDate = new Date(roundStartTime);
  const donationsEndTimeDate = new Date(roundEndTime);

  const isBeforeDonationPeriod = currentTime < donationsStartTimeDate;
  const isAfterDonationPeriod = currentTime > donationsEndTimeDate;
  const isDonationPeriod = !isBeforeDonationPeriod && !isAfterDonationPeriod;

  const timeToDonationEnd = calculateTimeRemaining(
    donationsEndTimeDate,
    currentTime
  );

  if (isAfterDonationPeriod) {
    return {
      isDonationPeriod: false,
      timeToDonationStart: undefined,
      timeToDonationEnd,
    };
  }

  const timeToDonationStart = calculateTimeRemaining(
    donationsStartTimeDate,
    currentTime
  );

  return {
    isDonationPeriod,
    timeToDonationStart,
    timeToDonationEnd,
  };
};
