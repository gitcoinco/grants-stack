import { Client } from "allo-indexer-client";
import useSWR from "swr";
import { getAddress } from "viem";

// What does this do?
const boundFetch = fetch.bind(window);

export function useRoundApprovedApplication(
  chainId: number,
  roundId: string,
  projectId: string
) {
  // use chain id and project id from url params
  const client = new Client(
    boundFetch,
    process.env.REACT_APP_ALLO_API_URL ?? "",
    chainId
  );

  return useSWR([roundId, "/projects"], async ([roundId]) => {
    const applications = await client.getRoundApplications(
      getAddress(roundId.toLowerCase())
    );

    return applications.find(
      (app) => app.projectId === projectId && app.status === "APPROVED"
    );
  });
}
