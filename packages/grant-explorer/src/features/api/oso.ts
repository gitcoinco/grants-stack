import { useState } from "react";
import useSWR from "swr";
import { Hex } from "viem";

const osoUrl = process.env.REACT_APP_OSO_URL;

export interface IOSOGrant {
  uid: Hex;
  projectUID: Hex;
  communityUID: Hex;
  title: string;
  description: string;
  createdAtMs: number;
}

export function useOSO(projectId?: string) {
  const [stats, setStats] = useState<IOSOGrant[]>([]);

  const getStatsFor = async (projectRegistryId: string) => {
    if (!osoUrl) throw new Error("Open Source Observer url not set.");
    try {
      const items: IOSOGrant[] = await fetch(
        `${osoUrl}/grants/external-id/${projectRegistryId}`
      ).then((res) => res.json());

      if (!Array.isArray(items)) {
        setStats([]);
        return;
      }

      const parsedItems =
        items
          .filter((grant) => grant.title)
          .map((grant) => ({
            ...grant
          }))
          .sort((a, b) => b.createdAtMs - a.createdAtMs) || [];

      setStats(parsedItems);
    } catch (e) {
      console.error(`No grants found for project: ${projectRegistryId}`);
      console.error(e);
      setStats([]);
    }
  };

  const { isLoading } = useSWR(
    `${osoUrl}/grants/external-id/${projectId}`,
    {
      fetcher: async () => projectId && getStatsFor(projectId),
    }
  );

  return {
    /**
     * Fetch GAP Indexer for grants for a project
     * @param projectRegistryId registryId
     */
    getStatsFor,
    /**
     * Grants for a project (loaded from GAP)
     */
    stats,
    isGapLoading: isLoading,
  };
}

