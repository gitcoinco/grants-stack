import { gql } from "graphql-request";
import { useQuery } from "@tanstack/react-query";
import { minutesToMilliseconds } from "date-fns";

import { GitcoinGraphqlService } from "@/kit/services/GitcoinGraphql";
import { Round } from "@/kit/domains/types";

export const getRoundKey = (query?: string) => {
  return ["rounds", query];
};

const defaultQuery: string = gql`
  query defaultRoundsQuery {
    rounds(first: 10) {
      id
      roundMetadata
      strategyName
      tags
    }
  }
`;

export const useRounds = (query: string = defaultQuery) => {
  const result = useQuery({
    queryKey: getRoundKey(query),
    queryFn: async () => GitcoinGraphqlService.getRounds(query),
    staleTime: minutesToMilliseconds(120),
  });

  // console.log(JSON.stringify(result));
  return result;
};

export const useRound = (roundId: string, chainId: number) => {
  const query = gql`
    query activeProjects {
      round(chainId: ${chainId}, id: "${roundId}") {
        id
        roundMetadata
      }
    }
  `;
  const result = useQuery({
    queryKey: getRoundKey(query),
    queryFn: async () => GitcoinGraphqlService.getRound(query),
    staleTime: minutesToMilliseconds(120),
  });

  // console.log(JSON.stringify(result));
  return result;
};
