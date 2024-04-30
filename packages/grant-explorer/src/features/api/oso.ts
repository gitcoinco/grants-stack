import { useState } from "react";
import useSWR from "swr";
import { Hex } from "viem";
import { gql, GraphQLClient } from "graphql-request";

const osoApiKey = process.env.REACT_APP_OSO_API_KEY as string;
const osoUrl = "https://opensource-observer.hasura.app/v1/graphql";
const graphQLClient = new GraphQLClient(osoUrl, {
  headers: {
    authorization: `Bearer ${osoApiKey}`,
  },
});
let hasFetched = false;

interface IOSOId {
  artifacts_by_project: {
    project_id: Hex;
  };
}

export interface IOSOStats {
  code_metrics_by_project: {
    contributors: number;
    first_commit_date: number;
  };
  events_monthly_to_project: [
    {
      bucket_month: number;
      amount: number;
    },
    {
      bucket_month: number;
      amount: number;
    },
    {
      bucket_month: number;
      amount: number;
    },
    {
      bucket_month: number;
      amount: number;
    },
    {
      bucket_month: number;
      amount: number;
    },
    {
      bucket_month: number;
      amount: number;
    },
  ];
}

export function useOSO(projectGithub?: string) {
  const emptyReturn: IOSOStats = {
    code_metrics_by_project: {
      contributors: 0,
      first_commit_date: 0,
    },
    events_monthly_to_project: [
      {
        bucket_month: 0,
        amount: 0,
      },
      {
        bucket_month: 0,
        amount: 0,
      },
      {
        bucket_month: 0,
        amount: 0,
      },
      {
        bucket_month: 0,
        amount: 0,
      },
      {
        bucket_month: 0,
        amount: 0,
      },
      {
        bucket_month: 0,
        amount: 0,
      },
    ],
  };
  const [stats, setStats] = useState<IOSOStats | null>(null);

  const getStatsFor = async (projectRegistryGithub: string) => {
    if (osoApiKey === "")
      throw new Error("OpenSourceObserver API key not set.");
    const queryId = gql`{
      artifacts_by_project(where: {artifact_name: {_ilike: "%${projectRegistryGithub}/%"}}
        distinct_on: project_id
      ) {
        project_id
      }
      }`;

    try {
      hasFetched = true;
      const idData: IOSOId = await graphQLClient.request<IOSOId>(queryId);

      if (!Array.isArray(idData.artifacts_by_project)) {
        setStats(emptyReturn);
        return;
      }

      const parsedId: IOSOId = {
        artifacts_by_project: idData.artifacts_by_project[0],
      };

      const queryStats = gql`{
        code_metrics_by_project(where: {project_id: {_eq: "${parsedId.artifacts_by_project.project_id}"}}) {
          contributors
          first_commit_date
        }
        events_monthly_to_project(
          where: {project_id: {_eq: "${parsedId.artifacts_by_project.project_id}"}, event_type: {_eq: "COMMIT_CODE"}}
          limit: 6
          order_by: {bucket_month: desc}
        ) {
          bucket_month
          amount
        }
      }`;

      const items: IOSOStats =
        await graphQLClient.request<IOSOStats>(queryStats);

      if (!Array.isArray(items.code_metrics_by_project)) {
        setStats(emptyReturn);
        return;
      }

      if (items.events_monthly_to_project.length === 6) {
        const parsedItems: IOSOStats = {
          code_metrics_by_project: items.code_metrics_by_project[0],
          events_monthly_to_project: items.events_monthly_to_project,
        };
        setStats(parsedItems);
      } else {
        const parsedItems: IOSOStats = {
          code_metrics_by_project: items.code_metrics_by_project[0],
          events_monthly_to_project: emptyReturn.events_monthly_to_project,
        };
        setStats(parsedItems);
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

  if (stats === null && !hasFetched)
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
