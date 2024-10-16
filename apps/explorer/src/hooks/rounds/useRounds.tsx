import { gql } from "graphql-request";
import { useQuery } from "@tanstack/react-query";
import { minutesToMilliseconds } from "date-fns";

import { GitcoinGraphqlService } from "@/services/GitcoinGraphql";
import { Round } from "@/domains/types";

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

export const useRounds = (
  query: string = defaultQuery
): { data: Round[]; isPending: boolean; isError: boolean } => {
  const result = useQuery({
    queryKey: getRoundKey(query),
    queryFn: async () => GitcoinGraphqlService.getRounds(query),
    staleTime: minutesToMilliseconds(120),
  });

  console.log(JSON.stringify(result));
  return result;
};
