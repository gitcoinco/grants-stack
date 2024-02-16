import { getAddress } from "viem";
import {
  ApplicationStatus,
  Eligibility,
  MetadataPointer,
  PayoutStrategy,
  Project,
  Round,
  RoundOverview,
  RoundVisibilityType,
  TimeFilterVariables,
} from "../data.types";

export const getRoundById = async (
  { roundId, chainId }: { roundId: string; chainId: number },
  {
    graphqlEndpoint,
    ipfsGateway,
  }: { ipfsGateway: string; graphqlEndpoint: string },
): Promise<Round> => {
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
      { ipfsGateway },
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
      { graphqlEndpoint, ipfsGateway },
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
    throw Error(`Unable to fetch round ${roundId} on chain ${chainId}`, {
      cause: error,
    });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
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
const fetchFromIPFS = (
  cid: string,
  { ipfsGateway }: { ipfsGateway: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  return fetch(`${ipfsGateway}/ipfs/${cid}`).then((resp) => {
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
      return "APPEAL";
    default:
      // XXX should this not throw an error?
      return "PENDING";
  }
}

async function loadApprovedProjectsMetadata(
  round: RoundResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any,
  {
    graphqlEndpoint,
    ipfsGateway,
  }: { graphqlEndpoint: string; ipfsGateway: string },
): Promise<Project[]> {
  if (round.projects.length === 0) {
    return [];
  }

  const approvedProjects = round.projects;

  const fetchApprovedProjectMetadata: Promise<Project>[] = approvedProjects.map(
    (project: RoundProjectResult) =>
      fetchMetadataAndMapProject(project, chainId, {
        graphqlEndpoint,
        ipfsGateway,
      }),
  );

  return Promise.all(fetchApprovedProjectMetadata);
}

async function fetchMetadataAndMapProject(
  project: RoundProjectResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any,
  {
    graphqlEndpoint,
    ipfsGateway,
  }: { graphqlEndpoint: string; ipfsGateway: string },
): Promise<Project> {
  const applicationData = await fetchFromIPFS(project.metaPtr.pointer, {
    ipfsGateway,
  });
  // NB: applicationData can be in two formats:
  // old format: { round, project, ... }
  // new format: { signature: "...", application: { round, project, ... } }
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
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
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      res.data?.projects[0]?.accounts.map(
        (account: { account: { address: string } }) =>
          getAddress(account.account.address),
      ) || []
    );
  } catch (error) {
    throw Error("Unable to fetch project owners", { cause: error });
  }
}

/*
Some timestamps are in milliseconds and others in overflowed values (115792089237316195423570985008687907853269984665640564039457584007913129639935)
See this query: https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet/graphql?query=query+%7B%0A+++rounds%28first%3A+3%2C%0A++++++orderBy%3A+roundEndTime%2C%0A++++++orderDirection%3A+asc%0A++++%29+%7B%0A++++++id%0A++++++roundEndTime%0A+++++%0A++++%7D%0A%7D
*/
const OVERFLOWED_TIMESTAMP =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const TIMESTAMP_KEYS = [
  "roundStartTime",
  "roundEndTime",
  "applicationsStartTime",
  "applicationsEndTime",
] as const;

export const cleanRoundData = (rounds: RoundOverview[]): RoundOverview[] => {
  return rounds.map((round) => ({
    ...round,
    ...TIMESTAMP_KEYS.reduce(
      (acc, key) => ({
        ...acc,
        [key]:
          round[key] === OVERFLOWED_TIMESTAMP
            ? undefined
            : round[key].length > 10 // This timestamp is in milliseconds, convert to seconds
            ? Math.round(Number(round[key]) / 1000).toString()
            : round[key],
      }),
      {},
    ),
  }));
};

type RoundsQueryVariables = {
  first?: number;
  orderBy?:
    | "createdAt"
    | "matchAmount"
    | "roundStartTime"
    | "roundEndTime"
    | "applicationsStartTime"
    | "applicationsEndTime";
  orderDirection?: "asc" | "desc";
  where?: {
    and: [
      { or: TimeFilterVariables[] },
      { payoutStrategy_?: { or: { strategyName: string }[] } },
    ];
  };
};

export const sortRounds = (
  rounds: RoundOverview[],
  { orderBy = "roundEndTime", orderDirection = "asc" }: RoundsQueryVariables,
): RoundOverview[] => {
  const dir = { asc: 1, desc: -1 };
  /*
  Something to note about sorting by matchAmount is that it doesn't
  take token decimals into consideration. For example USDC has 6 decimals.
  */
  const isNumber = ["matchAmount", ...TIMESTAMP_KEYS].includes(orderBy);

  const compareFn = isNumber
    ? (a: RoundOverview, b: RoundOverview): boolean =>
        BigInt(a[orderBy] ?? Number.MAX_SAFE_INTEGER) >
        BigInt(b[orderBy] ?? Number.MAX_SAFE_INTEGER)
    : (a: RoundOverview, b: RoundOverview): boolean =>
        (a[orderBy] ?? "") > (b[orderBy] ?? "");

  return [...rounds].sort((a, b) =>
    compareFn(a, b) ? dir[orderDirection] : -dir[orderDirection],
  );
};
