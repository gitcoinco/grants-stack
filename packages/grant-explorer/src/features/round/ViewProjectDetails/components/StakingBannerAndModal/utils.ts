import { isInfiniteDate } from "common";
import { DonationPeriodResult, TimeRemaining } from "./types";
import { Application } from "data-layer";

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

export const calculateDonationPeriod = ({
  application,
  currentTime,
  hasValidDonationDates,
}: {
  application?: Application;
  currentTime: Date;
  hasValidDonationDates: boolean;
}): DonationPeriodResult => {
  const { donationsStartTime, donationsEndTime } = application?.round ?? {};
  if (!hasValidDonationDates || !donationsStartTime || !donationsEndTime) {
    return {
      isDonationPeriod: undefined,
      timeToDonationStart: undefined,
      timeToDonationEnd: undefined,
    };
  }

  const donationsStartTimeDate = new Date(donationsStartTime);
  const donationsEndTimeDate = new Date(donationsEndTime);

  const isBeforeDonationPeriod = currentTime < donationsStartTimeDate;
  const isAfterDonationPeriod = currentTime > donationsEndTimeDate;
  const isDonationPeriod = !isBeforeDonationPeriod && !isAfterDonationPeriod;

  if (isAfterDonationPeriod) {
    return {
      isDonationPeriod: false,
      timeToDonationStart: undefined,
      timeToDonationEnd: undefined,
    };
  }

  const timeToDonationStart = calculateTimeRemaining(
    donationsStartTimeDate,
    currentTime
  );

  const timeToDonationEnd = calculateTimeRemaining(
    donationsEndTimeDate,
    currentTime
  );

  return {
    isDonationPeriod,
    timeToDonationStart,
    timeToDonationEnd,
  };
};
