import { useQuery } from "@tanstack/react-query";
import { RoundWithApplications } from "data-layer";

export const useRoundStakingSummary = (
  alloPoolId: string,
  chainId: string,
  isStakableRound: boolean
) => {
  const query = useQuery({
    enabled: isStakableRound,
    queryKey: ["poolSummary", alloPoolId, chainId],
    queryFn: () => getPoolSummary(alloPoolId, Number(chainId)),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export interface RoundWithStakes extends RoundWithApplications {
  stakes: Stake[];
  totalStakesByAnchorAddress: Record<string, string>;
}

export interface Stake {
  chainId: number;
  amount: string;
  poolId: string;
  recipient: string;
  sender: string;
  blockTimestamp: string;
}

const GET = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error: ${response.status} - ${errorData.message || "Unknown error"}`
    );
  }

  return response.json();
};

export async function getPoolSummary(
  alloPoolId: string,
  chainId: number
): Promise<RoundWithStakes> {
  try {
    const url = `${process.env.REACT_APP_STAKING_HUB_ENDPOINT}/api/pools/${chainId}/${alloPoolId}/summary`;
    const response: RoundWithStakes = await GET(url);
    return response;
  } catch (error) {
    console.error("Error fetching pool info and stakes:", error);
    throw error;
  }
}
