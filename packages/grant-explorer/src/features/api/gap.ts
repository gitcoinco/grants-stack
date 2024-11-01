import { useState } from "react";
import useSWR from "swr";
import { Hex } from "viem";

const indexerUrl = process.env.REACT_APP_KARMA_GAP_INDEXER_URL;

export interface IGrantStatus {
  uid: Hex;
  title: string;
  text: string;
  createdAtMs: number;
}

export interface IGapGrant {
  uid: Hex;
  projectUID: Hex;
  communityUID: Hex;
  title: string;
  description: string;
  createdAtMs: number;
  milestones: {
    uid: Hex;
    title: string;
    description: string;
    endsAtMs: number;
    completed?: IGrantStatus;
    isGrantUpdate?: boolean;
  }[];
  updates: IGrantStatus[];
  completed?: IGrantStatus;
}

export interface IGapImpact {
  id: string;
  uid: Hex;
  schemaUID: Hex;
  refUID: Hex;
  attester: Hex;
  recipient: Hex;
  revoked: boolean;
  revocationTime: number;
  createdAt: string;
  updatedAt: string;
  chainID: number;
  type: string;
  data: {
    work: string;
    impact: string;
    proof: string;
    startedAt: number;
    completedAt: number;
    type: string;
  };
  txid: string;
  verified: IGapVerified[];
}

export interface IGapVerified {
  id: string;
  uid: Hex;
  schemaUID: Hex;
  refUID: Hex;
  attester: Hex;
  recipient: Hex;
  revoked: boolean;
  revocationTime: number;
  createdAt: string;
  updatedAt: string;
  chainID: number;
  type: string;
  data: {
    type: string;
    reason: string;
  };
}

export function useGap(projectId?: string) {
  const [grants, setGrants] = useState<IGapGrant[]>([]);
  const [impacts, setImpacts] = useState<IGapImpact[]>([]);

  const getGrantsFor = async (projectRegistryId: string) => {
    if (!indexerUrl) throw new Error("GAP Indexer url not set.");
    try {
      const items: IGapGrant[] = await fetch(
        `${indexerUrl}/grants/external-id/${projectRegistryId}`
      ).then((res) => res.json());

      if (!Array.isArray(items)) {
        setGrants([]);
        return;
      }

      const parsedItems =
        items
          .filter((grant) => grant.title)
          .map((grant) => ({
            ...grant,
            milestones: grant.milestones
              .concat(
                grant.updates.map((update) => ({
                  uid: update.uid,
                  description: update.text,
                  endsAtMs: update.createdAtMs,
                  title: update.title,
                  isGrantUpdate: true,
                  completed: update,
                }))
              )
              .sort((a, b) => {
                const dateToCompareA = a.completed?.createdAtMs || a.endsAtMs;
                const dateToCompareB = b.completed?.createdAtMs || b.endsAtMs;
                return dateToCompareB - dateToCompareA;
              }),
          }))
          .sort((a, b) => b.createdAtMs - a.createdAtMs) || [];

      setGrants(parsedItems);
    } catch (e) {
      console.error(`No grants found for project: ${projectRegistryId}`);
      console.error(e);
      setGrants([]);
    }
  };

  const getImpactsFor = async (projectRegistryId: string) => {
    if (!indexerUrl) throw new Error("GAP Indexer url not set.");
    try {
      const items: IGapImpact[] = await fetch(
        `${indexerUrl}/grants/external-id/${projectRegistryId}/impacts`
      ).then((res) => res.json());

      if (!Array.isArray(items)) {
        setImpacts([]);
        return;
      }

      setImpacts(items);
    } catch (e) {
      console.error(`No impacts found for project: ${projectRegistryId}`);
      console.error(e);
      setImpacts([]);
    }
  };

  const { isLoading: isGrantsLoading } = useSWR(
    `${indexerUrl}/grants/external-id/${projectId}`,
    {
      fetcher: async () => projectId && getGrantsFor(projectId),
    }
  );

  const { isLoading: isImpactsLoading } = useSWR(
    `${indexerUrl}/grants/external-id/${projectId}/impacts`,
    {
      fetcher: async () => projectId && getImpactsFor(projectId),
    }
  );

  return {
    /**
     * Fetch GAP Indexer for grants for a project
     * @param projectRegistryId registryId
     */
    getGrantsFor,
    /**
     * Fetch GAP Indexer for impacts for a project
     * @param projectRegistryId registryId
     */
    getImpactsFor,
    /**
     * Grants for a project (loaded from GAP)
     */
    grants,
    /**
     * Impacts for a project (loaded from GAP)
     */
    impacts,
    /**
     * Loading state for grants and impacts
     */
    isGapLoading: isGrantsLoading || isImpactsLoading,
  };
}

export const gapAppUrl = `${process.env.REACT_APP_KARMA_GAP_APP_URL}`;

export const getGapProjectGrantUrl = (projectUID: string, grantUID?: string) =>
  `${gapAppUrl}/project/${projectUID}/${
    grantUID ? `?tab=grants&grant=${grantUID}` : ""
  }`;

export const getGapProjectImpactUrl = (projectUID: string) =>
  `${gapAppUrl}/project/${projectUID}/impact`;
