export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
}

export type DonationPeriodResult = {
  isDonationPeriod?: boolean;
  timeToDonationStart?: TimeRemaining;
  timeToDonationEnd?: TimeRemaining;
};
