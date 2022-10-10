import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { chain, useNetwork } from "wagmi";
import {
  goerliClient,
  optimismKovanClient,
  roundManagerGoerliClient,
  roundManagerOptimismKovanClient,
} from "../services/graphqlClient";

export function useGranthubClient(
  chainId?: number
): ApolloClient<NormalizedCacheObject> | null {
  const { chain: currentChain } = useNetwork();

  const id = chainId || currentChain?.id;

  switch (id) {
    case chain.optimismKovan.id:
      return optimismKovanClient;
    case chain.goerli.id:
      return goerliClient;
    default:
      return null;
  }
}

export function useRoundManagerClient(
  chainId?: number
): ApolloClient<NormalizedCacheObject> | null {
  const { chain: currentChain } = useNetwork();

  const id = chainId || currentChain?.id;

  switch (id) {
    case chain.optimismKovan.id:
      return roundManagerOptimismKovanClient;
    case chain.goerli.id:
      return roundManagerGoerliClient;
    default:
      return null;
  }
}

// Get all required subgraph clients
export function useClients(chainId?: number): {
  grantHubClient: ApolloClient<NormalizedCacheObject> | null;
  roundManagerClient: ApolloClient<NormalizedCacheObject> | null;
} {
  const grantHubClient = useGranthubClient(chainId);
  const roundManagerClient = useRoundManagerClient(chainId);
  return {
    grantHubClient,
    roundManagerClient,
  };
}
