import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";

const endpoint = "https://indexer.hyperindex.xyz/98cb471/v1/graphql";

const getStakesQuery = gql`
  query getStakes($chainId: numeric!, $poolId: numeric!, $recipient: String!) {
    TokenLock_Locked(
      where: {
        chainId: { _eq: $chainId }
        poolId: { _eq: $poolId }
        recipient: { _eq: $recipient }
      }
    ) {
      amount
      chainId
      poolId
      recipient
      sender
    }
  }
`;

export const useGetApplicationStakes = (
  chainId: number,
  poolId: number,
  recipient: string,
  isStakableRound: boolean
) => {
  const query = useQuery({
    enabled: isStakableRound,
    queryKey: ["getApplicationStakes", chainId, poolId, recipient],
    queryFn: () => getApplicationStakes(chainId, poolId, recipient),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

const GET = async (chainId: number, poolId: number, recipient: string) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: getStakesQuery,
      variables: { chainId, poolId, recipient },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error: ${response.status} - ${errorData.message || "Unknown error"}`
    );
  }

  return response.json();
};

interface ApplicationStake {
  amount: string;
  chainId: string;
  poolId: string;
  recipient: string;
  sender: string;
}

export async function getApplicationStakes(
  chainId: number,
  poolId: number,
  recipient: string
): Promise<string> {
  try {
    const response = (await GET(chainId, poolId, recipient)).data
      .TokenLock_Locked as ApplicationStake[];
    const totalStakes = response.reduce(
      (acc, stake) => acc + Number(stake.amount),
      0
    );

    return (totalStakes / 10 ** 18).toFixed(3);
  } catch (error) {
    console.error("Error fetching pool info and stakes:", error);
    throw error;
  }
}
