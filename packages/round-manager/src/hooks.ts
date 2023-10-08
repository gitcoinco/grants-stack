import useSWR from "swr";
import { Client } from "allo-indexer-client";
import { useWallet } from "./features/common/Auth";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export function useDebugMode(): boolean {
  const [searchParams] = useSearchParams();

  return (
    (process.env.REACT_APP_ALLOW_URL_DEBUG_MODE === "true" &&
      searchParams.get("debug") === "true") ||
    process.env.REACT_APP_DEBUG_MODE === "true"
  );
}

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

export function useRoundMatchingFunds(
  roundId: string,
  ignoreSaturation?: boolean,
  overrides?: Blob
) {
  const client = useAlloIndexerClient();
  return useSWR(
    [roundId, "/matches", overrides, ignoreSaturation],
    async ([roundId]) => {
      console.log(roundId, client);

      return fetch(
        "https://raw.githubusercontent.com/ufkhan97/gg18_payouts/main/CurrentRoundMatching.json"
      )
        .then((r) => r.json())
        .then((list) =>
          // eslint-disable-next-line
          list.map((matchItem: any) => ({
            totalReceived: BigInt(matchItem.totalReceived),
            sumOfSqrt: BigInt(matchItem.sumOfSqrt),
            matched: BigInt(matchItem.matched),
            matchedUSD: matchItem.matchedUSD,
            projectName: matchItem.projectName,
            payoutAddress: matchItem.payoutAddress,
            contributionsCount: matchItem.contributionsCount,
            projectId: matchItem.projectId,
            applicationId: matchItem.applicationId,
          }))
        );
    }
  );
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
