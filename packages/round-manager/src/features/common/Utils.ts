import { getRoundStrategyTitle } from "common";
import { PrettyDatesResult, PrettyDate } from "./types";
import { Round } from "../api/types";

export const verticalTabStyles = (selected: boolean) =>
  selected
    ? "whitespace-nowrap py-4 px-1 text-sm outline-none"
    : "text-grey-400 hover:text-grey-700 whitespace-nowrap py-4 px-1 font-medium text-sm";

export const horizontalTabStyles = (selected: boolean) =>
  selected
    ? "border-violet-500 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm outline-none"
    : "border-transparent text-grey-400 hover:text-grey-700 hover:border-grey-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

export const getPayoutRoundDescription = (key: string | undefined) => {
  if (!key) return "Unknown";
  return getRoundStrategyTitle(key);
};

export const prettyDates = (start: Date, end: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
};

export const prettyDates2 = (
  start: Date,
  end: Date | null
): PrettyDatesResult => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // This removes the am/pm and uses 24-hour format
    timeZone: "UTC",
    timeZoneName: "short",
  };

  // Format date without commas and separate the time and timezone
  const formatDate = (date: Date): PrettyDate => {
    const dateParts = date.toLocaleDateString("en-US", options).split(", ");
    const [time, timezone] = dateParts[1].split(" ");
    return {
      date: dateParts[0],
      time: time,
      timezone: timezone,
    };
  };

  const formattedStart = formatDate(start);

  if (end === null) {
    return {
      start: formattedStart,
      end: null,
    };
  }

  const formattedEnd = formatDate(end);
  return {
    start: formattedStart,
    end: formattedEnd,
  };
};

export const prettyDates3 = (start: Date, end: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
};

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const statusStyleMap: Record<number, { status: string; style: string }> =
  {
    [0]: {
      status: "Pre-round",
      style: "bg-grey-200 text-grey-500",
    },
    [1]: {
      status: "Round in progress",
      style: "bg-green-200 text-white",
    },
    [2]: {
      status: "Applications open",
      style: "bg-blue-100 text-grey-500",
    },
    [3]: {
      status: "Applications closed",
      style: "bg-rose-200 text-grey-500",
    },
    [4]: {
      status: "Round ended",
      style: "bg-grey-200 text-grey-500",
    },
    [5]: {
      status: "Funding pending",
      style: "text-orange-400",
    },
  };

function getCurrentStatus(round: Round): number {
  const currentTime = new Date();

  if (currentTime < round.roundStartTime) {
    return 0; // "Pre-round"
  } else if (
    currentTime >= round.roundStartTime &&
    currentTime < round.roundEndTime
  ) {
    if (round.strategyName === "allov2.DirectGrantsLiteStrategy") {
      return 1; // "Round in progress" for direct grant
    } else if (
      currentTime >= round.applicationsStartTime &&
      currentTime < round.applicationsEndTime
    ) {
      return 2; // "Applications open"
    } else if (currentTime >= round.applicationsEndTime) {
      return 3; // "Applications closed"
    }
    if (
      currentTime >= round.applicationsStartTime &&
      currentTime < round.applicationsEndTime &&
      currentTime > round.roundStartTime
    ) {
      return 1; // "Round in progress"
    }
  } else if (currentTime >= round.roundEndTime) {
    return 4; // "Round ended"
  }
  return 0; // Default to "Round not started" for any other case
}

// Function to get the status and style based on the current status code
export function getStatusStyle(round: Round): {
  status: string;
  style: string;
} {
  const statusCode = getCurrentStatus(round);

  return statusStyleMap[statusCode];
}
