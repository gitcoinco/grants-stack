import { useState } from "react";
import useSWR from "swr";
import { Hex } from "viem";
import { gql, GraphQLClient } from "graphql-request";

const osoApiKey = process.env.REACT_APP_OSO_API_KEY as string;
const osoUrl = "https://www.opensource.observer/api/v1/graphql";
const graphQLClient = new GraphQLClient(osoUrl, {
  headers: {
    authorization: `Bearer ${osoApiKey}`,
  },
});
let hasFetched = false;
let fetchedProject = "";

export interface IOSOStats {
  oso_codeMetricsByProjectV1: {
    contributorCount: number;
    firstCommitDate: number;
    activeDeveloperCount6Months: number;
  };
}

export function useOSO(projectGithub?: string) {
  const emptyReturn: IOSOStats = {
    oso_codeMetricsByProjectV1: {
      contributorCount: 0,
      firstCommitDate: 0,
      activeDeveloperCount6Months: 0,
    },
  };
  const [stats, setStats] = useState<IOSOStats | null>(null);

  const getStatsFor = async (projectRegistryGithub: string) => {
    fetchedProject = projectRegistryGithub;
    if (osoApiKey === "")
      throw new Error("OpenSourceObserver API key not set.");
    const queryVars = {
      where: {
        displayName: {
          _ilike: `${projectRegistryGithub}`,
        },
      },
    };
    const queryStats = gql`
      query myQuery($where: Oso_CodeMetricsByProjectV1BoolExp) {
        oso_codeMetricsByProjectV1(where: $where) {
          contributorCount
          firstCommitDate
          activeDeveloperCount6Months
        }
      }
    `;

    try {
      hasFetched = true;
      const items: IOSOStats = await graphQLClient.request<IOSOStats>(
        queryStats,
        queryVars
      );

      if (!Array.isArray(items.oso_codeMetricsByProjectV1)) {
        throw new Error("no stats returned");
      }

      if (items.oso_codeMetricsByProjectV1.length > 0) {
        const parsedItems: IOSOStats = {
          oso_codeMetricsByProjectV1: items.oso_codeMetricsByProjectV1[0],
        };
        setStats(parsedItems);
      } else {
        throw new Error("no stats returned");
      }
    } catch (e) {
      console.error(`No stats found for project: ${projectGithub}`);
      console.error(e);
      setStats(emptyReturn);
    }
  };

  const { isLoading } = useSWR(osoUrl, {
    fetcher: async () => projectGithub && getStatsFor(projectGithub),
    revalidateOnMount: true,
  });

  if (fetchedProject !== projectGithub)
    projectGithub && getStatsFor(projectGithub);
  return {
    /**
     * Fetch OSO for stats on a project
     * @param projectRegistryGithub projectGithub
     */
    getStatsFor,
    /**
     * Stats for a project (loaded from OSO)
     */
    stats,
    isStatsLoading: isLoading,
  };
}
