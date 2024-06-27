/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CartProject, IPFSObject, Round } from "./types";
import {
  getTokensByChainId,
  ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_DIRECT_OLD,
  TToken,
} from "common";
import { useSearchParams } from "react-router-dom";
import { getAddress } from "viem";

export function useDebugMode(): boolean {
  const [searchParams] = useSearchParams();

  return (
    (process.env.REACT_APP_ALLOW_URL_DEBUG_MODE === "true" &&
      searchParams.get("debug") === "true") ||
    process.env.REACT_APP_DEBUG_MODE === "true"
  );
}

/**
 * Pin data to IPFS
 * The data could either be a file or a JSON object
 *
 * @param obj - the data to be pinned on IPFS
 * @returns the unique content identifier that points to the data
 */
export const pinToIPFS = (obj: IPFSObject) => {
  const params = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
    },
    body: {
      pinataMetadata: obj.metadata,
      pinataOptions: {
        cidVersion: 1,
      },
    },
  };

  /* typeof Blob === 'object', so we need to check against instanceof */
  if (obj.content instanceof Blob) {
    // content is a blob
    const fd = new FormData();
    fd.append("file", obj.content as Blob);
    fd.append("pinataOptions", JSON.stringify(params.body.pinataOptions));
    fd.append("pinataMetadata", JSON.stringify(params.body.pinataMetadata));

    return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      ...params,
      body: fd,
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  } else {
    // content is a JSON object
    return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...params.body, pinataContent: obj.content }),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  }
};

export interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export const getTimeLeft = (fromNowToTimestampStr: string): TimeLeft => {
  const targetTimestamp = Number(fromNowToTimestampStr);

  // Some timestamps are returned as overflowed (1.15e+77)
  // We parse these into undefined to show as "No end date" rather than make the date diff calculation
  if (targetTimestamp > Number.MAX_SAFE_INTEGER) {
    return {};
  }

  // TODO replace with differenceInCalendarDays from 'date-fns'
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000); // current timestamp in seconds
  const secondsPerDay = 60 * 60 * 24; // number of seconds per day
  const secondsPerHour = 60 * 60; // number of seconds per day
  const secondsPerMinute = 60;

  const differenceInSeconds = targetTimestamp - currentTimestampInSeconds;

  const days = Math.floor(differenceInSeconds / secondsPerDay);
  const hours = Math.floor(differenceInSeconds / secondsPerHour) % 24; // % 24 to substract total days
  const minutes = Math.floor(differenceInSeconds / secondsPerMinute) % 60; // % 60 to substract total hours
  const seconds = Math.floor(differenceInSeconds) % 60; // % 60 to substract total minutes

  return { days, hours, minutes, seconds };
};

export const parseTimeLeftString = (timeLeft: TimeLeft): string => {
  const { days = 0, hours = 0, minutes = 0 } = timeLeft;

  const daysString = days > 0 ? `${days} ${days === 1 ? "day" : "days"}, ` : "";
  const hoursString =
    hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}, ` : "";
  const minutesString =
    minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : "";

  return `${daysString}${hoursString}${minutesString}`;
};

export const getDaysLeft = (fromNowToTimestampStr: string) =>
  getTimeLeft(fromNowToTimestampStr).days;

export const isDirectRound = (round: Round) =>
  // @ts-expect-error support old rounds
  round.payoutStrategy.strategyName === ROUND_PAYOUT_DIRECT_OLD ||
  round.payoutStrategy.strategyName === ROUND_PAYOUT_DIRECT ||
  round.payoutStrategy.strategyName === "allov2.DirectGrantsLiteStrategy" ||
  round.payoutStrategy.strategyName === "allov2.DirectGrantsSimpleStrategy";

export const isInfiniteDate = (roundTime: Date) => {
  return (
    roundTime.toString() === "Invalid Date" || roundTime.getFullYear() <= 1970
  );
};

type GroupedCartProjects = {
  [chainId: number]: {
    [roundId: string]: CartProject[];
  };
};

export type GroupedCartProjectsByRoundId = {
  [roundId: string]: CartProject[];
};

export const groupProjectsInCart = (
  cartProjects: CartProject[]
): GroupedCartProjects => {
  // Initialize an empty object to store the grouped cart projects
  const groupedCartProjects: GroupedCartProjects = {};

  // Iterate over each cart project and group them by chainId and roundId
  cartProjects.forEach((cartProject) => {
    const { chainId, roundId } = cartProject;

    // If the chainId doesn't exist in the groupedCartProjects object, create it
    if (!groupedCartProjects[chainId]) {
      groupedCartProjects[chainId] = {};
    }

    // If the roundId doesn't exist in the chainId group, create it
    if (!groupedCartProjects[chainId][roundId]) {
      groupedCartProjects[chainId][roundId] = [];
    }

    // Add the cartProject to the corresponding roundId group
    groupedCartProjects[chainId][roundId].push(cartProject);
  });

  return groupedCartProjects;
};

export function getPayoutToken(
  token: string,
  chainId: number
): TToken | undefined {
  return getVotingTokenOptions(chainId).find(
    (t) => t.address === getAddress(token)
  );
}

export function getVotingTokenOptions(chainId: number): TToken[] {
  return getTokensByChainId(chainId).filter((token) => token.canVote === true);
}

export function dateFromMs(ms: number) {
  if (!ms) return "Invalid date";
  const normalized = String(ms).length < 13 ? ms * 1000 : ms;
  const date = new Date(normalized);

  return Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export const getRoundStates = ({
  roundStartTimeInSecsStr,
  roundEndTimeInSecsStr,
  applicationsEndTimeInSecsStr,
  atTimeMs: currentTimeMs,
}: {
  roundStartTimeInSecsStr: string | undefined;
  roundEndTimeInSecsStr: string | undefined;
  applicationsEndTimeInSecsStr: string | undefined;
  atTimeMs: number;
}): undefined | Array<"accepting-applications" | "active" | "ended"> => {
  const safeSecStrToMs = (timestampInSecStr: string | undefined) =>
    timestampInSecStr === undefined ||
    Number(timestampInSecStr) > Number.MAX_SAFE_INTEGER
      ? undefined
      : Number(timestampInSecStr) * 1000;

  const roundStartTimeMs = safeSecStrToMs(roundStartTimeInSecsStr);
  const roundEndTimeMs = safeSecStrToMs(roundEndTimeInSecsStr);
  const applicationsEndTimeMs = safeSecStrToMs(applicationsEndTimeInSecsStr);

  const states: Array<"accepting-applications" | "active" | "ended"> = [];
  if (
    roundStartTimeMs !== undefined &&
    roundEndTimeMs !== undefined &&
    currentTimeMs > roundStartTimeMs &&
    currentTimeMs < roundEndTimeMs
  ) {
    states.push("active");
  }

  if (roundEndTimeMs !== undefined && currentTimeMs > roundEndTimeMs) {
    states.push("ended");
  }

  if (
    applicationsEndTimeMs !== undefined &&
    currentTimeMs < applicationsEndTimeMs
  ) {
    states.push("accepting-applications");
  }

  return states.length > 0 ? states : undefined;
};
