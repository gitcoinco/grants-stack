import useSWR from "swr";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import { Client } from "allo-indexer-client";
import { Address } from "viem";
import { ChainId } from "common";

export function useAlloIndexerClient(): Client {
  const chainId = useChainId();

  return useMemo(() => {
    return new Client(
      fetch.bind(window),
      process.env.REACT_APP_ALLO_API_URL ?? "",
      chainId
    );
  }, [chainId]);
}

type UseMatchingEstimatesParams = {
  roundId: Address;
  chainid: ChainId;
  potentialVotes: { contributor: string; recipient: string; amount: bigint }[];
};

export function useMatchingEstimates(params: UseMatchingEstimatesParams[]) {
  const client = useAlloIndexerClient();

  return useSWR(params, (params) => {
    return params.map((params) =>
      client.getMatchingEstimates(
        params.roundId,
        params.chainid.toString(),
        // @ts-expect-error stringify bigint beforehand
        params.potentialVotes.map((vote) => ({
          ...vote,
          amount: vote.amount.toString(),
        }))
      )
    );
  });
}
