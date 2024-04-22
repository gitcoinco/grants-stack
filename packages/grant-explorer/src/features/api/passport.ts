import { datadogLogs } from "@datadog/browser-logs";
import {
  fetchPassport,
  PassportResponse,
  PassportResponseSchema,
  PassportState,
  submitPassport,
  roundToPassportIdAndKeyMap,
  ChainId,
} from "common";
import { Round } from "data-layer";
import { useEffect, useMemo } from "react";
import useSWR from "swr";

export { submitPassport, fetchPassport, PassportState };
export type { PassportResponse };

export function usePassport({
  address,
  round,
}: {
  address: string | undefined;
  round: Round;
}) {
  const { communityId, apiKey } = roundToPassportIdAndKeyMap(round);

  const swr = useSWR<
    PassportResponse,
    Response,
    () => [string, string, string] | null
  >(
    () => (address && round ? [address, communityId, apiKey] : null),
    async (args) => {
      // for avalance we need to submit the passport to fetch the score.
      const res =
        round.chainId === ChainId.AVALANCHE
          ? await submitPassport(...args)
          : await fetchPassport(...args);

      if (res.ok) {
        return PassportResponseSchema.parse(await res.json());
      } else {
        throw res;
      }
    }
  );

  const passportState = useMemo(() => {
    if (swr.error) {
      switch (swr.error.status) {
        case 400: // unregistered/nonexistent passport address
          return PassportState.INVALID_PASSPORT;
        case 401: // invalid API key
          swr.error.json().then((json) => {
            console.error("invalid API key", json);
          });
          return PassportState.ERROR;
        default:
          console.error("Error fetching passport", swr.error);
          return PassportState.ERROR;
      }
    }

    if (swr.data) {
      if (
        !swr.data.score ||
        !swr.data.evidence ||
        swr.data.status === "ERROR"
      ) {
        datadogLogs.logger.error(
          `error: callFetchPassport - invalid score response`,
          swr.data
        );
        return PassportState.INVALID_RESPONSE;
      }

      return PassportState.SCORE_AVAILABLE;
    }

    if (!address) {
      return PassportState.NOT_CONNECTED;
    }

    return PassportState.LOADING;
  }, [swr.error, swr.data, address]);

  const passportScore = useMemo(() => {
    if (swr.data?.evidence) {
      return swr.data.evidence.rawScore;
    }
    return 0;
  }, [swr.data]);

  const PROCESSING_REFETCH_INTERVAL_MS = 3000;
  /** If passport is still processing, refetch it every PROCESSING_REFETCH_INTERVAL_MS */
  useEffect(() => {
    if (swr.data?.status === "PROCESSING") {
      setTimeout(() => {
        /* Revalidate */
        swr.mutate();
      }, PROCESSING_REFETCH_INTERVAL_MS);
    }
  }, [swr]);

  const passportColor = useMemo<PassportColor>(() => {
    if (passportScore < 15) {
      return "orange";
    } else if (passportScore >= 15 && passportScore < 25) {
      return "yellow";
    } else {
      return "green";
    }
  }, [passportScore]);

  const donationImpact = useMemo(() => {
    if (passportScore < 15) {
      return 0;
    } else if (passportScore >= 15 && passportScore < 25) {
      return 10 * (passportScore - 15);
    } else {
      return 100;
    }
  }, [passportScore]);

  return {
    passportState,
    passportScore,
    passportColor,
    donationImpact,
  };
}

export type PassportColor = "orange" | "yellow" | "green" | "white" | "black";

const passportColorToClassName: Record<PassportColor, string> = {
  orange: "text-orange-400",
  yellow: "text-yellow-400",
  green: "text-green-400",
  white: "text-white",
  black: "text-black",
};

export const getClassForPassportColor = (color: PassportColor) =>
  passportColorToClassName[color];
