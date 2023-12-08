import { getAddress } from "viem";
import {
  ApplicationStatus,
  Eligibility,
  MetadataPointer,
  PayoutStrategy,
  Project,
  Round,
  RoundVisibilityType,
} from "../data.types";

export const getRoundById = async ({
  graphqlEndpoint,
  roundId,
  chainId,
}: {
  graphqlEndpoint: string;
  roundId: string;
  chainId: number;
}): Promise<Round> => {
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
            payoutStrategy {
              id
              strategyName
            }
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
      graphqlEndpoint,
      { roundId: roundId.toLowerCase() },
    );

    const round: RoundResult = res.data.rounds[0];

    const roundMetadata: RoundMetadata = await fetchFromIPFS(
      round.roundMetaPtr.pointer,
    );

    round.projects = round.projects.map((project) => {
      return {
        ...project,
        status: convertStatus(project.status),
      };
    });

    const approvedProjectsWithMetadata = await loadApprovedProjectsMetadata(
      round,
      chainId,
      { graphqlEndpoint },
    );

    return {
      id: roundId,
      roundMetadata,
      applicationsStartTime: new Date(
        parseInt(round.applicationsStartTime) * 1000,
      ),
      applicationsEndTime: new Date(parseInt(round.applicationsEndTime) * 1000),
      roundStartTime: new Date(parseInt(round.roundStartTime) * 1000),
      roundEndTime: new Date(parseInt(round.roundEndTime) * 1000),
      token: round.token,
      payoutStrategy: round.payoutStrategy,
      votingStrategy: round.votingStrategy,
      ownedBy: round.program.id,
      approvedProjects: approvedProjectsWithMetadata,
    };
  } catch (error) {
    console.error("getRoundById", error);
    throw Error("Unable to fetch round");
  }
};

/**
 * Shape of subgraph response
 */
interface GetRoundByIdResult {
  data: {
    rounds: RoundResult[];
  };
}

const graphql_fetch = async (
  query: string,
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  variables: object = {},
  fromProjectRegistry = false,
) => {
  if (fromProjectRegistry) {
    endpoint = endpoint.replace("grants-round", "grants-hub");
  }

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  }).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};

interface RoundResult {
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
type RoundMetadata = {
  name: string;
  roundType: RoundVisibilityType;
  eligibility: Eligibility;
  programContractAddress: string;
};

/**
 * Fetch data from IPFS
 *
 * @param cid - the unique content identifier that points to the data
 */
const fetchFromIPFS = (cid: string) => {
  return fetch(
    `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`,
  ).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};

function convertStatus(status: string | number): ApplicationStatus {
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
      // XXX should this not throw an error?
      return "PENDING";
  }
}

async function loadApprovedProjectsMetadata(
  round: RoundResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any,
  { graphqlEndpoint }: { graphqlEndpoint: string },
): Promise<Project[]> {
  if (round.projects.length === 0) {
    return [];
  }

  const approvedProjects = round.projects;

  const fetchApprovedProjectMetadata: Promise<Project>[] = approvedProjects.map(
    (project: RoundProjectResult) =>
      fetchMetadataAndMapProject(project, chainId, { graphqlEndpoint }),
  );

  return Promise.all(fetchApprovedProjectMetadata);
}

async function fetchMetadataAndMapProject(
  project: RoundProjectResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any,
  { graphqlEndpoint }: { graphqlEndpoint: string },
): Promise<Project> {
  const applicationData = await fetchFromIPFS(project.metaPtr.pointer);
  // NB: applicationData can be in two formats:
  // old format: { round, project, ... }
  // new format: { signature: "...", application: { round, project, ... } }
  const application = applicationData.application || applicationData;
  const projectMetadataFromApplication = application.project;
  const projectRegistryId = `0x${projectMetadataFromApplication.id}`;
  const projectOwners = await getProjectOwners(chainId, projectRegistryId, {
    graphqlEndpoint,
  });

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

async function getProjectOwners(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any,
  projectRegistryId: string,
  { graphqlEndpoint }: { graphqlEndpoint: string },
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
      graphqlEndpoint,
      { projectRegistryId },
      true,
    );

    return (
      res.data?.projects[0]?.accounts.map(
        (account: { account: { address: string } }) =>
          getAddress(account.account.address),
      ) || []
    );
  } catch (error) {
    console.log("getProjectOwners", error);
    throw Error("Unable to fetch project owners");
  }
}
