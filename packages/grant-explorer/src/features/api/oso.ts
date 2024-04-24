import { useState } from "react";
import useSWR from "swr";
import { Hex } from "viem";
import { gql, GraphQLClient } from "graphql-request";
import internal from "stream";
import { date } from "zod";

const osoApiKey = process.env.REACT_APP_OSO_API_KEY;
const osoUrl = "https://opensource-observer.hasura.app/v1/graphql";
const graphQLClient = new GraphQLClient(osoUrl, {
  headers: {
    authorization: `Bearer ${osoApiKey}`,
  },
})

export interface IOSOStats {
  code_metrics_by_project: {
    contributors : number;
    first_commit_date : number;
  }
}

export function useOSO(projectTitle?: string) {
  const emptyReturn : IOSOStats = {
    code_metrics_by_project:
      {
        contributors : 0,
        first_commit_date : 0
      }
  };
  const [stats, setStats] = useState<IOSOStats>(emptyReturn);

  const getStatsFor = async (projectRegistryTitle: string) => {
    if (!osoUrl) throw new Error("Open Source Observer url not set.");
    const query = gql`{
      code_metrics_by_project(where: {project_slug: {_eq: "${projectRegistryTitle}"}}) {
        contributors
        first_commit_date
      }
    }`

    try {
      const items: IOSOStats = await graphQLClient.request<IOSOStats>(query)
      console.log(items);

      if (!Array.isArray(items.code_metrics_by_project)) {
        setStats(emptyReturn);
        return;
      }

      console.log(items.code_metrics_by_project[0].contributors);
      const parsedItems : IOSOStats = {
        code_metrics_by_project:
          {
            contributors : items.code_metrics_by_project[0].contributors,
            first_commit_date : items.code_metrics_by_project[0].first_commit_date
          }
      };


      setStats(parsedItems);
    } catch (e) {
      console.error(`No stats found for project: ${projectRegistryTitle}`);
      console.error(e);
      setStats(emptyReturn);
    }
  };

  const { isLoading } = useSWR(osoUrl, {
      fetcher: async () => projectTitle && getStatsFor(projectTitle),
    }
  );

  return {
    /**
     * Fetch OSO for stats on a project
     * @param projectRegistryTitle projectTitle
     */
    getStatsFor,
    /**
     * Stats for a project (loaded from OSO)
     */
    stats,
    isGapLoading: isLoading,
  };
}

