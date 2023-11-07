import { useState } from "react";
import { Hex } from "viem";

const indexerUrl = process.env.REACT_APP_KARMA_GAP_INDEXER_URL;

interface Status {
  title: string;
  text: string;
  createdAt: number;
}

export interface IGapGrant {
  uid: Hex;
  projectUID: Hex;
  communityUID: Hex;
  title: string;
  description: string;
  createdAt: number;
  milestones: {
    title: string;
    description: string;
    endsAt: number;
    completed?: Status;
  }[];
  updates: Status[];
}

export function useGap() {
  const [grants, setGrants] = useState<IGapGrant[]>([]);
  const [isGapLoading, setIsGapLoading] = useState(false);

  const getGrantsFor = async (projectRegistryId: string) => {
    if (!indexerUrl) throw new Error("GAP Indexer url not set.");
    try {
      setIsGapLoading(true);
      const items: IGapGrant[] = await fetch(
        `${indexerUrl}/grants/external-id/${projectRegistryId}`
      ).then((res) => res.json());

      if (Array.isArray(items)) setGrants(items.filter((grant) => grant.title));
    } catch (e) {
      console.error(`No grants found for project: ${projectRegistryId}`);
      console.error(e);
      setGrants([]);
    } finally {
      setIsGapLoading(false);
    }
  };

  return {
    /**
     * Fetch GAP Indexer for grants for a project
     * @param projectRegistryId registryId
     */
    getGrantsFor,
    /**
     * Grants for a project (loaded from GAP)
     */
    grants,
    isGapLoading,
  };
}
