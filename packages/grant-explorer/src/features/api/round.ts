import { fetchFromIPFS, graphql_fetch } from "./utils";
import {
  ApplicationStatus,
  Eligibility,
  MetadataPointer,
  Project,
  Round,
} from "./types";
import {
  Client as AlloIndexerClient,
  DetailedVote as Contribution,
} from "allo-indexer-client";
import { useEffect, useState } from "react";
import { getAddress } from "viem";

/**
 * Shape of subgraph response
 */
export interface GetRoundByIdResult {
  data: {
    rounds: RoundResult[];
  };
}

/**
 * Shape of subgraph response of Round
 */
export interface RoundResult {
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
  votingStrategy: string;
  projectsMetaPtr?: MetadataPointer | null;
  projects: RoundProjectResult[];
}
interface RoundProjectResult {
  id: string;
  project: string;
  status: string | number;
  applicationIndex: number;
  metaPtr: MetadataPointer;
}

/**
 * Shape of IPFS content of Round RoundMetaPtr
 */
export type RoundMetadata = {
  name: string;
  roundType: string;
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
      data: { chainId: number; data: Contribution[] }[];
    }
  | { type: "error"; error: string };

export async function getRoundById(
  roundId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any
): Promise<Round> {
  try {
    // get the subgraph for round by $roundId
    const res: GetRoundByIdResult = await graphql_fetch(
      `
        query GetRoundById($roundId: String) {
          rounds(where: {
            id: $roundId
          }) {
            id
            program {
              id
            }
            roundMetaPtr {
              protocol
              pointer
            }
            applicationMetaPtr {
              protocol
              pointer
            }
            applicationsStartTime
            applicationsEndTime
            roundStartTime
            roundEndTime
            token
            votingStrategy
            projectsMetaPtr {
              pointer
            }
            projects(
              first: 1000
              where:{
                status: 1
              }
            ) {
              id
              project
              status
              applicationIndex
              metaPtr {
                protocol
                pointer
              }
            }
          }
        }
      `,
      chainId,
      { roundId }
    );

    const round: RoundResult = res.data.rounds[0];

    const roundMetadata: RoundMetadata = await fetchFromIPFS(
      round.roundMetaPtr.pointer
    );

    round.projects = round.projects.map((project) => {
      return {
        ...project,
        status: convertStatus(project.status),
      };
    });

    const approvedProjectsWithMetadata = await loadApprovedProjectsMetadata(
      round,
      chainId
    );

    return {
      id: roundId,
      roundMetadata,
      applicationsStartTime: new Date(
        parseInt(round.applicationsStartTime) * 1000
      ),
      applicationsEndTime: new Date(parseInt(round.applicationsEndTime) * 1000),
      roundStartTime: new Date(parseInt(round.roundStartTime) * 1000),
      roundEndTime: new Date(parseInt(round.roundEndTime) * 1000),
      token: round.token,
      votingStrategy: round.votingStrategy,
      ownedBy: round.program.id,
      approvedProjects: approvedProjectsWithMetadata,
    };
  } catch (error) {
    console.error("getRoundById", error);
    throw Error("Unable to fetch round");
  }
}

export function convertStatus(status: string | number) {
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

async function loadApprovedProjectsMetadata(
  round: RoundResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any
): Promise<Project[]> {
  if (round.projects.length === 0) {
    return [];
  }

  const approvedProjects = round.projects;

  const fetchApprovedProjectMetadata: Promise<Project>[] = approvedProjects.map(
    (project: RoundProjectResult) =>
      fetchMetadataAndMapProject(project, chainId)
  );

  return Promise.all(fetchApprovedProjectMetadata);
}

async function fetchMetadataAndMapProject(
  project: RoundProjectResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any
): Promise<Project> {
  const applicationData = await fetchFromIPFS(project.metaPtr.pointer);
  // NB: applicationData can be in two formats:
  // old format: { round, project, ... }
  // new format: { signature: "...", application: { round, project, ... } }
  const application = applicationData.application || applicationData;
  const projectMetadataFromApplication = application.project;
  const projectRegistryId = `0x${projectMetadataFromApplication.id}`;
  const projectOwners = await getProjectOwners(chainId, projectRegistryId);

  return {
    grantApplicationId: project.id,
    grantApplicationFormAnswers: application.answers,
    projectRegistryId: project.project,
    recipient: application.recipient,
    projectMetadata: {
      ...projectMetadataFromApplication,
      owners: projectOwners.map((address: string) => ({ address })),
    },
    status: ApplicationStatus.APPROVED,
    applicationIndex: project.applicationIndex,
  };
}

export async function getProjectOwners(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any,
  projectRegistryId: string
) {
  try {
    // get the subgraph for project owners by $projectRegistryId
    const res = await graphql_fetch(
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

  useEffect(() => {
    if (!process.env.REACT_APP_ALLO_API_URL) {
      throw new Error("REACT_APP_ALLO_API_URL is not set");
    }

    const fetchContributions = async () => {
      const fetchPromises: Promise<{
        chainId: number;
        data: Contribution[];
        error?: string;
      }>[] = chainIds.map((chainId: number) => {
        if (!process.env.REACT_APP_ALLO_API_URL) {
          throw new Error("REACT_APP_ALLO_API_URL is not set");
        }

        const client = new AlloIndexerClient(
          fetch.bind(window),
          process.env.REACT_APP_ALLO_API_URL,
          chainId
        );

        let address = "";
        try {
          // ensure the address is a valid address
          address = getAddress(rawAddress.toLowerCase());
        } catch (e) {
          return Promise.resolve({
            chainId,
            error: "Invalid address",
            data: [],
          });
        }

        return client
          .getContributionsByAddress(address)
          .then((data) => {
            return { chainId, error: undefined, data };
          })
          .catch((error) => {
            console.log(
              `Error fetching contribution history for chain ${chainId}:`,
              error
            );
            return { chainId, error: error.toString() as string, data: [] };
          });
      });

      const fetchResults = await Promise.all(fetchPromises);

      if (fetchResults.every((result) => result.error)) {
        setState({
          type: "error",
          error: "Error fetching contribution history for all chains",
        });
      } else {
        setState({ type: "loaded", data: fetchResults });
      }
    };

    fetchContributions();
  }, [chainIds, rawAddress]);

  return state;
};
