import useSWR from "swr";
import { Client } from "allo-indexer-client";
import { useWallet } from "./features/common/Auth";
import { useMemo } from "react";

export function useAlloIndexerClient(): Client {
  const { chain } = useWallet();

  return useMemo(() => {
    return new Client(
      fetch.bind(window),
      process.env.REACT_APP_ALLO_API_URL ?? "",
      chain.id
    );
  }, [chain.id]);
}

export function useRoundMatchingFunds(roundId: string) {
  const client = useAlloIndexerClient();
  return useSWR([roundId, "/matches"], ([roundId]) => {
    return client.getRoundMatchingFunds(roundId);
  });
}

export function useRound(roundId: string) {
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
