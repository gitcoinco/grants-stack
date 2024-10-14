// gap.ts
import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { GAP } from "@show-karma/karma-gap-sdk";

export interface IGrantStatus {
  uid: string;
  title: string;
  text: string;
  createdAtMs: number;
}

export interface IGapGrant {
  uid: string;
  projectUID: string;
  communityUID: string;
  title: string;
  description: string;
  createdAtMs: number;
  milestones: {
    uid: string;
    title: string;
    description: string;
    endsAtMs: number;
    completed?: IGrantStatus;
    isGrantUpdate?: boolean;
  }[];
  updates: IGrantStatus[];
}

export interface IProject {
  uid: string;
  title: string;
  description: string;
  // Add other project properties as needed
}

export interface IMilestone {
  uid: string;
  title: string;
  description: string;
  endsAtMs: number;
  // Add other milestone properties as needed
}

export function useGap(indexerUrl: string) {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [grants, setGrants] = useState<IGapGrant[]>([]);
  const [project, setProject] = useState<IProject | null>(null);
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isGapLoading, setIsGapLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getSigner() {
      if (window.ethereum) {
        try {
          // Request account access if needed
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setSigner(signer);
        } catch (err) {
          console.error("Error getting signer:", err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } else {
        console.error("No Ethereum provider found");
        setError(new Error("No Ethereum provider found"));
      }
    }
    getSigner();
  }, []);

  // Initialize the GAP client
  const gapClient = new GAP({
    network: "optimism", // Adjust to your network
  });

  // Existing functions for fetching data
  const getGrantsFor = useCallback(
    async (projectRegistryId: string) => {
      if (!indexerUrl) throw new Error("GAP Indexer url not set.");
      setIsGapLoading(true);
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
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsGapLoading(false);
      }
    },
    [indexerUrl]
  );

  const getProjectById = useCallback(
    async (projectId: string) => {
      if (!indexerUrl) throw new Error("GAP Indexer URL not set.");
      setIsGapLoading(true);
      try {
        const projectData: IProject = await fetch(
          `${indexerUrl}/projects/${projectId}`
        ).then((res) => res.json());

        setProject(projectData);
      } catch (e) {
        console.error(`No project found for ID: ${projectId}`);
        console.error(e);
        setProject(null);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsGapLoading(false);
      }
    },
    [indexerUrl]
  );

  const getProjectBySlug = useCallback(
    async (projectSlug: string) => {
      if (!indexerUrl) throw new Error("GAP Indexer URL not set.");
      setIsGapLoading(true);
      try {
        const projectData: IProject = await fetch(
          `${indexerUrl}/projects/slug/${projectSlug}`
        ).then((res) => res.json());

        setProject(projectData);
      } catch (e) {
        console.error(`No project found for slug: ${projectSlug}`);
        console.error(e);
        setProject(null);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsGapLoading(false);
      }
    },
    [indexerUrl]
  );

  // Function to create a project
  const createProject = useCallback(
    async (projectData: {
      title: string;
      description: string;
      imageURL: string;
      links?: { type: string; url: string }[];
      tags?: { name: string }[];
      members?: `0x${string}`[]; // array of member addresses
    }) => {
      if (!signer || !gapClient) {
        throw new Error("Signer is required to create a project");
      }
      setIsGapLoading(true);
      try {
        const recipientAddress = (await signer.getAddress()) as `0x${string}`;

        // Attest the Project
        const projectAttestation = await gapClient.attest({
          schemaName: "Project",
          data: { project: true },
          to: recipientAddress,
          signer: signer,
        });

        // Attest ProjectDetails with a reference to the Project UID
        const projectDetailsAttestation = await gapClient.attest({
          schemaName: "ProjectDetails",
          data: {
            title: projectData.title,
            description: projectData.description,
            imageURL: projectData.imageURL,
            links: projectData.links,
            tags: projectData.tags,
          },
          to: recipientAddress,
          refUID: projectAttestation.uids[0],
          signer: signer,
        });

        // Attest MemberOf for each member
        if (projectData.members && projectData.members.length > 0) {
          for (const memberAddress of projectData.members) {
            await gapClient.attest({
              schemaName: "MemberOf",
              data: { memberOf: true },
              to: memberAddress,
              refUID: projectAttestation.uids[0],
              signer: signer,
            });
          }
        }

        console.log("Project created successfully!");
        return {
          projectUID: projectAttestation.uids[0],
          projectDetailsUID: projectDetailsAttestation.uids[0],
        };
      } catch (error) {
        console.error("Error creating project:", error);
        throw error;
      } finally {
        setIsGapLoading(false);
      }
    },
    [signer, gapClient]
  );

  // Function to create a grant and add it to a project
  const createGrant = useCallback(
    async (
      grantData: {
        communityUID: string;
        title: string;
        proposalURL: string;
        description?: string;
        cycle?: string;
        season?: string;
        milestones?: Array<{
          title: string;
          description: string;
          endsAt: number;
        }>;
      },
      projectUID: `0x${string}`
    ) => {
      if (!signer || !gapClient) {
        throw new Error("Signer is required to create a grant");
      }
      setIsGapLoading(true);
      try {
        const recipientAddress = (await signer.getAddress()) as `0x${string}`;

        // Attest the Grant
        const grantAttestation = await gapClient.attest({
          schemaName: "Grant",
          data: { communityUID: grantData.communityUID },
          to: recipientAddress,
          refUID: projectUID,
          signer: signer,
        });

        // Attest GrantDetails with a reference to the Grant UID
        const grantDetailsAttestation = await gapClient.attest({
          schemaName: "GrantDetails",
          data: {
            title: grantData.title,
            proposalURL: grantData.proposalURL,
            description: grantData.description,
            cycle: grantData.cycle,
            season: grantData.season,
          },
          to: recipientAddress,
          refUID: grantAttestation.uids[0],
          signer: signer,
        });

        // Attest Milestones
        if (grantData.milestones && grantData.milestones.length > 0) {
          for (const milestoneData of grantData.milestones) {
            await gapClient.attest({
              schemaName: "Milestone",
              data: {
                title: milestoneData.title,
                description: milestoneData.description,
                endsAt: milestoneData.endsAt,
              },
              to: recipientAddress,
              refUID: grantAttestation.uids[0],
              signer: signer,
            });
          }
        }

        console.log("Grant created and added to project successfully!");
        return {
          grantUID: grantAttestation.uids[0],
          grantDetailsUID: grantDetailsAttestation.uids[0],
        };
      } catch (error) {
        console.error("Error creating grant:", error);
        throw error;
      } finally {
        setIsGapLoading(false);
      }
    },
    [signer, gapClient]
  );

  // Function to create a milestone for a grant
  const createMilestone = useCallback(
    async (
      milestoneData: {
        title: string;
        description: string;
        endsAt: number;
      },
      grantUID: `0x${string}`
    ) => {
      if (!signer || !gapClient) {
        throw new Error("Signer is required to create a milestone");
      }
      setIsGapLoading(true);
      try {
        const recipientAddress = (await signer.getAddress()) as `0x${string}`;

        // Attest the Milestone
        const milestoneAttestation = await gapClient.attest({
          schemaName: "Milestone",
          data: {
            title: milestoneData.title,
            description: milestoneData.description,
            endsAt: milestoneData.endsAt,
          },
          to: recipientAddress,
          refUID: grantUID,
          signer: signer,
        });

        console.log("Milestone created successfully!");
        return {
          milestoneUID: milestoneAttestation.uids[0],
        };
      } catch (error) {
        console.error("Error creating milestone:", error);
        throw error;
      } finally {
        setIsGapLoading(false);
      }
    },
    [signer, gapClient]
  );

  // Function to get milestones for a grant
  const getMilestonesForGrant = useCallback(
    async (grantUID: string) => {
      if (!indexerUrl) throw new Error("GAP Indexer URL not set.");
      setIsGapLoading(true);
      try {
        const milestonesData: IMilestone[] = await fetch(
          `${indexerUrl}/milestones/grant/${grantUID}`
        ).then((res) => res.json());

        setMilestones(milestonesData);
      } catch (e) {
        console.error(`No milestones found for grant UID: ${grantUID}`);
        console.error(e);
        setMilestones([]);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsGapLoading(false);
      }
    },
    [indexerUrl]
  );

  return {
    /**
     * Fetch grants for a project
     * @param projectRegistryId Registry ID
     */
    getGrantsFor,
    /**
     * Fetch project data by ID
     * @param projectId Project ID
     */
    getProjectById,
    /**
     * Fetch project data by slug
     * @param projectSlug Project slug
     */
    getProjectBySlug,
    /**
     * Create a new project
     * @param projectData Project data
     */
    createProject,
    /**
     * Create a new grant and add to a project
     * @param grantData Grant data
     * @param projectUID Project UID
     */
    createGrant,
    /**
     * Create a new milestone for a grant
     * @param milestoneData Milestone data
     * @param grantUID Grant UID
     */
    createMilestone,
    /**
     * Get milestones for a grant
     * @param grantUID Grant UID
     */
    getMilestonesForGrant,
    /**
     * Grants for a project (loaded from GAP)
     */
    grants,
    /**
     * Project data fetched from GAP
     */
    project,
    /**
     * Milestones data fetched from GAP
     */
    milestones,
    /**
     * Error occurred during fetching
     */
    error,
    /**
     * Loading state for GAP data
     */
    isGapLoading,
  };
}
