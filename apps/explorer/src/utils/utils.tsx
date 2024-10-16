import { Round } from "@allo-team/kit";
import { isAfter, formatDistanceToNow } from "date-fns";

/**
 *
 * @returns Midnight UTC of the current local Date.
 */
export const createISOTimestamp = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
};

export const bigIntReplacer = (key: any, value: any) =>
  typeof value === "bigint" ? value.toString() : value;

export const toNow = (date?: string) =>
  date ? formatDistanceToNow(date, { addSuffix: true }) : undefined;

export const getRoundTime = (phases: Round["phases"] = {}): string => {
  const now = new Date();

  if (isAfter(phases.applicationsStartTime!, now))
    return `Starts ${toNow(phases.applicationsStartTime)}`;
  if (isAfter(now, phases.donationsEndTime!))
    return `Ended ${toNow(phases.donationsEndTime)}`;
  if (isAfter(phases.donationsEndTime!, now))
    return `Ends ${toNow(phases.donationsEndTime)}`;
  return "";
};
