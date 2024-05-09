import {
  __deprecated_fetchFromIPFS,
  __deprecated_graphql_fetch,
} from "./utils";
import {
  ApplicationStatus,
  Eligibility,
  MetadataPointer,
  PayoutStrategy,
  Project,
  Round,
} from "./types";
import { useEffect, useState } from "react";
import { Address, Hex, getAddress } from "viem";
import { RoundVisibilityType } from "common";
import { Contribution, useDataLayer } from "data-layer";
import { getPublicClient } from "@wagmi/core";

/**
 * Shape of subgraph response
 */
export interface __deprecated_GetRoundByIdResult {
  data: {
    rounds: __deprecated_RoundResult[];
  };
}

/**
 * Shape of subgraph response of Round
 */
export interface __deprecated_RoundResult {
  id: string;
  program: {
    id: string;
  };
  roundMetaPtr: MetadataPointer;
  applicationMetaPtr: MetadataPointer;
  applicationsStartTime: string;
  applicationsEndTime: string;
  roundStartTime: string;
  roundEndTime: string;
  token: string;
  payoutStrategy: PayoutStrategy;
  votingStrategy: string;
  projectsMetaPtr?: MetadataPointer | null;
  projects: __deprecated_RoundProjectResult[];
}
interface __deprecated_RoundProjectResult {
  id: string;
  project: string;
  status: string | number;
  applicationIndex: number;
  metaPtr: MetadataPointer;
}

/**
 * Shape of IPFS content of Round RoundMetaPtr
 */
export type __deprecated_RoundMetadata = {
  name: string;
  roundType: RoundVisibilityType;
  eligibility: Eligibility;
  programContractAddress: string;
};

export type RoundProject = {
  id: string;
  status: ApplicationStatus;
  payoutAddress: string;
};

export type ContributionHistoryState =
  | { type: "loading" }
  | {
      type: "loaded";
      data: { chainIds: number[]; data: Contribution[] };
    }
  | { type: "error"; error: string };

export function __deprecated_convertStatus(status: string | number) {
  switch (status) {
    case 0:
      return "PENDING";
    case 1:
      return "APPROVED";
    case 2:
      return "REJECTED";
    case 3:
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

async function __deprecated_loadApprovedProjectsMetadata(
  round: __deprecated_RoundResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any
): Promise<Project[]> {
  if (round.projects.length === 0) {
    return [];
  }

  const approvedProjects = round.projects;

  const fetchApprovedProjectMetadata: Promise<Project>[] = approvedProjects.map(
    (project: __deprecated_RoundProjectResult) =>
      __deprecated_fetchMetadataAndMapProject(project, chainId)
  );

  return Promise.all(fetchApprovedProjectMetadata);
}

async function __deprecated_fetchMetadataAndMapProject(
  project: __deprecated_RoundProjectResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any
): Promise<Project> {
  const applicationData = await __deprecated_fetchFromIPFS(
    project.metaPtr.pointer
  );
  // NB: applicationData can be in two formats:
  // old format: { round, project, ... }
  // new format: { signature: "...", application: { round, project, ... } }
  const application = applicationData.application || applicationData;
  const projectMetadataFromApplication = application.project;
  const projectRegistryId = `0x${projectMetadataFromApplication.id}`;
  const projectOwners = await __deprecated_getProjectOwners(
    chainId,
    projectRegistryId
  );

  return {
    grantApplicationId: project.id,
    grantApplicationFormAnswers: application.answers,
    projectRegistryId: project.project,
    recipient: application.recipient,
    projectMetadata: {
      ...projectMetadataFromApplication,
      owners: projectOwners.map((address: string) => ({ address })),
    },
    status: "APPROVED",
    applicationIndex: project.applicationIndex,
  };
}

export async function __deprecated_getProjectOwners(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any,
  projectRegistryId: string
) {
  try {
    // get the subgraph for project owners by $projectRegistryId
    const res = await __deprecated_graphql_fetch(
      `
        query GetProjectOwners($projectRegistryId: String) {
          projects(where: {
            id: $projectRegistryId
          }) {
            id
            accounts {
              account {
                address
              }
            }
          }
        }
      `,
      chainId,
      { projectRegistryId },
      true
    );

    return (
      res.data?.projects[0]?.accounts.map(
        (account: { account: { address: string } }) =>
          getAddress(account.account.address)
      ) || []
    );
  } catch (error) {
    console.log("getProjectOwners", error);
    throw Error("Unable to fetch project owners");
  }
}

export const useContributionHistory = (
  chainIds: number[],
  rawAddress: string
) => {
  const [state, setState] = useState<ContributionHistoryState>({
    type: "loading",
  });
  const dataLayer = useDataLayer();

  useEffect(() => {
    if (!process.env.REACT_APP_ALLO_API_URL) {
      throw new Error("REACT_APP_ALLO_API_URL is not set");
    }

    const fetchContributions = async () => {
      let address: Address = "0x";
      try {
        address = getAddress(rawAddress.toLowerCase());
      } catch (e) {
        return Promise.resolve({
          chainIds,
          error: "Invalid address",
          data: [],
        });
      }

      const contributions = await dataLayer.getDonationsByDonorAddress({
        address,
        chainIds,
      });

      try {
        const contributionsWithTimestamp: Contribution[] = await Promise.all(
          contributions.map(async (contribution) => {
            const publicClient = getPublicClient({
              chainId: contribution.chainId,
            });
            const tx = await publicClient.getTransaction({
              hash: contribution.transactionHash as Hex,
            });

            const block = await publicClient.getBlock({
              blockHash: tx.blockHash,
            });

            return {
              ...contribution,
              timestamp: BigInt(block.timestamp),
            };
          })
        );

        setState({
          type: "loaded",
          data: {
            chainIds: chainIds,
            data: contributionsWithTimestamp,
          },
        });
      } catch (e) {
        console.error("Error fetching contribution history for all chains", e);
        setState({
          type: "error",
          error: "Error fetching contribution history for all chains",
        });
      }
    };

    fetchContributions();
  }, [chainIds, dataLayer, rawAddress]);

  return state;
};
