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
}

export function useGap(projectId?: string) {
  const [grants, setGrants] = useState<IGapGrant[]>([]);

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

  const { isLoading } = useSWR(
    `${indexerUrl}/grants/external-id/${projectId}`,
    {
      fetcher: async () => projectId && getGrantsFor(projectId),
    }
  );

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
    isGapLoading: isLoading,
  };
}

export const gapAppUrl = `${process.env.REACT_APP_KARMA_GAP_APP_URL}`;

export const getGapProjectUrl = (projectUID: string, grantUID?: string) =>
  `${gapAppUrl}/project/${projectUID}/${
    grantUID ? `?tab=grants&grant=${grantUID}` : ""
  }`;
