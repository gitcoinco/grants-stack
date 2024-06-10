import { Client } from "allo-indexer-client";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { useAccount } from "wagmi";

export function useDebugMode(): boolean {
  const [searchParams] = useSearchParams();

  return (
    (process.env.REACT_APP_ALLOW_URL_DEBUG_MODE === "true" &&
      searchParams.get("debug") === "true") ||
    process.env.REACT_APP_DEBUG_MODE === "true"
  );
}

export function useAlloIndexerClient(): Client {
  const { chainId } = useAccount();

  return useMemo(() => {
    if (!chainId) {
      throw new Error("Chain ID is not set");
    }
    return new Client(
      fetch.bind(window),
      process.env.REACT_APP_INDEXER_V2_API_URL ?? "",
      chainId
    );
  }, [chainId]);
}

export function useRoundMatchingFunds(
  roundId: string,
  ignoreSaturation?: boolean,
  overrides?: Blob
) {
  const client = useAlloIndexerClient();
  return useSWR(
    [roundId, "/matches", overrides, ignoreSaturation],
    ([roundId]) => {
      return client.getRoundMatchingFunds(roundId, overrides, ignoreSaturation);
    }
  );
}

export function useRound(roundId: string | number) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/stats"], ([roundId]) => {
    return client.getRoundBy("id", roundId);
  });
}

export function useRoundApplications(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/applications"], ([roundId]) => {
    return client.getRoundApplications(roundId);
  });
}
