import {
  ApplicationStatus,
  ApprovedProject,
  MatchingStatsData,
  MetadataPointer,
  Round,
} from "./types";
import { fetchFromIPFS, graphql_fetch } from "./utils";
import {
  payoutStrategyContract,
  roundFactoryContract,
  roundImplementationContract,
} from "./contracts";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";

/**
 * Fetch a round by ID
 * @param signerOrProvider - provider
 * @param roundId - the ID of a specific round for detail
 */
export async function getRoundById(
  signerOrProvider: Web3Provider,
  roundId: string
): Promise<Round> {
  try {
    // fetch chain id
    const { chainId } = await signerOrProvider.getNetwork();

    // query the subgraph for all rounds by the given address in the given program
    const res = await graphql_fetch(
      `
          query GetRounds($address: String, $programId: String, $roundId: String) {
            rounds(where: {
        ${roundId ? `id: $roundId` : ``}
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
              projectsMetaPtr {
                pointer
              }
              projects(first: 1000) {
                id
                project
                metaPtr {
                  protocol
                  pointer
                }
              }
              roles(where: {
                role: "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5"
              }) {
                accounts {
                  address
                }
              }
            }
          }
        `,
      chainId,
      { roundId }
    );

    const round: RoundResult = res.data.rounds[0];

    // fetch round and application metadata from IPFS
    const [roundMetadata, applicationMetadata] = await Promise.all([
      fetchFromIPFS(res.data.rounds[0].roundMetaPtr.pointer),
      fetchFromIPFS(res.data.rounds[0].applicationMetaPtr.pointer),
    ]);

    const approvedProjectsWithMetadata = await loadApprovedProjects(
      round,
      chainId
    );

    console.log("approvedProjectsWithMetadata", approvedProjectsWithMetadata);
    const operatorWallets = res.data.rounds[0].roles[0].accounts.map(
      (account: { address: string }) => account.address
    );

    return {
      id: res.data.rounds[0].id,
      roundMetadata,
      applicationMetadata,
      applicationsStartTime: new Date(
        res.data.rounds[0].applicationsStartTime * 1000
      ),
      applicationsEndTime: new Date(
        res.data.rounds[0].applicationsEndTime * 1000
      ),
      roundStartTime: new Date(res.data.rounds[0].roundStartTime * 1000),
      roundEndTime: new Date(res.data.rounds[0].roundEndTime * 1000),
      token: res.data.rounds[0].token,
      votingStrategy: res.data.rounds[0].votingStrategy,
      payoutStrategy: res.data.rounds[0].payoutStrategy,
      ownedBy: res.data.rounds[0].program.id,
      operatorWallets: operatorWallets,
      approvedProjects: approvedProjectsWithMetadata,
    };
  } catch (error) {
    console.error("getRoundById", error);
    throw "Unable to fetch round";
  }
}

/**
 * Fetch a list of rounds
 * @param address - a valid round operator
 * @param signerOrProvider - provider
 * @param programId - the ID of the program the round belongs to
 * @param roundId - the ID of a specific round for detail
 */
export async function listRounds(
  address: string,
  signerOrProvider: Web3Provider,
  programId: string,
  roundId?: string
): Promise<{ rounds: Round[] }> {
  try {
    // fetch chain id
    const { chainId } = await signerOrProvider.getNetwork();

    // query the subgraph for all rounds by the given address in the given program
    const res = await graphql_fetch(
      `
          query GetRounds($address: String, $programId: String, $roundId: String) {
            rounds(where: {
        ${address ? `accounts_: { address: $address } ` : ``}
        ${programId ? `program: $programId` : ``}
        ${roundId ? `id: $roundId` : ``}
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
              roles(where: {
                role: "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5"
              }) {
                accounts {
                  address
                }
              }
            }
          }
        `,
      chainId,
      { address: address?.toLowerCase(), programId, roundId }
    );

    const rounds: Round[] = [];

    for (const round of res.data.rounds) {
      // fetch round and application metadata from IPFS
      const [roundMetadata, applicationMetadata] = await Promise.all([
        fetchFromIPFS(round.roundMetaPtr.pointer),
        fetchFromIPFS(round.applicationMetaPtr.pointer),
      ]);

      const operatorWallets = round.roles[0].accounts.map(
        (account: { address: string }) => account.address
      );

      rounds.push({
        id: round.id,
        roundMetadata,
        applicationMetadata,
        applicationsStartTime: new Date(round.applicationsStartTime * 1000),
        applicationsEndTime: new Date(round.applicationsEndTime * 1000),
        roundStartTime: new Date(round.roundStartTime * 1000),
        roundEndTime: new Date(round.roundEndTime * 1000),
        token: round.token,
        votingStrategy: round.votingStrategy,
        payoutStrategy: res.data.rounds[0].payoutStrategy,
        ownedBy: round.program.id,
        operatorWallets: operatorWallets,
      });
    }

    return { rounds };
  } catch (error) {
    console.error("listRounds", error);
    throw new Error("Unable to fetch rounds");
  }
}

/**
 * Deploys a round by invoking the create funciton on RoundFactory
 *
 * @param round
 * @param signerOrProvider
 * @returns
 */
export async function deployRoundContract(
  round: Round,
  signerOrProvider: Signer
): Promise<{ transactionBlockNumber: number }> {
  try {
    const chainId = await signerOrProvider.getChainId();

    const _roundFactoryContract = roundFactoryContract(chainId);
    const roundFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _roundFactoryContract.address!,
      _roundFactoryContract.abi,
      signerOrProvider
    );

    if (!round.applicationsEndTime) {
      round.applicationsEndTime = round.roundStartTime;
    }

    round.operatorWallets = round.operatorWallets?.filter((e) => e !== "");

    // encode input parameters
    const params = [
      round.votingStrategy,
      round.payoutStrategy,
      new Date(round.applicationsStartTime).getTime() / 1000,
      new Date(round.applicationsEndTime).getTime() / 1000,
      new Date(round.roundStartTime).getTime() / 1000,
      new Date(round.roundEndTime).getTime() / 1000,
      round.token,
      round.store,
      round.applicationStore,
      round.operatorWallets?.slice(0, 1),
      round.operatorWallets,
    ];

    const encodedParameters = ethers.utils.defaultAbiCoder.encode(
      [
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "tuple(uint256 protocol, string pointer)",
        "tuple(uint256 protocol, string pointer)",
        "address[]",
        "address[]",
      ],
      params
    );

    // Deploy a new Round contract
    const tx = await roundFactory.create(encodedParameters, round.ownedBy);

    const receipt = await tx.wait(); // wait for transaction receipt

    let roundAddress;

    if (receipt.events) {
      const event = receipt.events.find(
        (e: { event: string }) => e.event === "RoundCreated"
      );
      if (event && event.args) {
        roundAddress = event.args.roundAddress;
      }
    }

    console.log("✅ Round Contract Transaction hash: ", tx.hash);
    console.log("✅ Round address: ", roundAddress);

    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
    };
  } catch (error) {
    console.error("deployRoundContract", error);
    throw new Error("Unable to create round");
  }
}

/**
 * Shape of subgraph response of Round
 */
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
  votingStrategy: {
    id: string;
  };
  projectsMetaPtr?: MetadataPointer | null;
  projects: RoundProjectResult[];
}

interface RoundProjectResult {
  id: string;
  project: string;
  metaPtr: MetadataPointer;
}

export type RoundProject = {
  id: string;
  status: ApplicationStatus;
  payoutAddress: string;
};

type RoundProjects = Array<RoundProject>;

async function loadApprovedProjects(
  round: RoundResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any
): Promise<ApprovedProject[]> {
  console.log("loadingprojects");
  if (!round.projectsMetaPtr || round.projects.length === 0) {
    return [];
  }
  const allRoundProjects = round.projects;

  // TODO - when subgraph is ready, filter approved projects by project.status instead of through projectsMetaPtr
  const approvedProjectIds: string[] = await getApprovedProjectIds(
    round.projectsMetaPtr
  );
  const approvedProjects = allRoundProjects.filter((project) =>
    approvedProjectIds.includes(project.id)
  );
  const fetchApprovedProjectMetadata: Promise<ApprovedProject>[] =
    approvedProjects.map((project: RoundProjectResult) =>
      fetchMetadataAndMapProject(project, chainId)
    );
  return Promise.all(fetchApprovedProjectMetadata);
}

async function getApprovedProjectIds(
  roundProjectStatusesPtr?: MetadataPointer
): Promise<string[]> {
  const roundProjectStatuses: RoundProjects = roundProjectStatusesPtr
    ? await fetchFromIPFS(roundProjectStatusesPtr.pointer)
    : [];
  return roundProjectStatuses
    .filter((project) => project.status === ApplicationStatus.APPROVED)
    .map((project) => project.id);
}

async function fetchMetadataAndMapProject(
  project: RoundProjectResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any
): Promise<ApprovedProject> {
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
    projectRegistryId: project.project,
    recipient: application.recipient,
    projectMetadata: {
      ...projectMetadataFromApplication,
      owners: projectOwners.map((address: string) => ({ address })),
    },
    status: ApplicationStatus.APPROVED,
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
          ethers.utils.getAddress(account.account.address)
      ) || []
    );
  } catch (error) {
    console.log("getProjectOwners", error);
    throw Error("Unable to fetch project owners");
  }
}

interface FinalizeRoundToContractProps {
  roundId: string;
  encodedDistribution: string;
  signerOrProvider: Signer;
}

export async function finalizeRoundToContract({
  roundId,
  encodedDistribution,
  signerOrProvider,
}: FinalizeRoundToContractProps) {
  try {
    const roundImplementation = new ethers.Contract(
      roundId,
      roundImplementationContract.abi,
      signerOrProvider
    );

    // Finalize round
    const tx = await roundImplementation.updateDistribution(
      encodedDistribution
    );
    const receipt = await tx.wait();

    console.log("✅ Transaction hash: ", tx.hash);
    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
    };
  } catch (error) {
    console.error("finalizeRoundToContract", error);
    throw new Error("Unable to finalize Round");
  }
}

/**
 * Fetch finalized matching distribution
 * @param roundId - the ID of a specific round for detail
 */
export async function fetchMatchingDistribution(
  roundId: string
): Promise<{
  distributionMetaPtr: MetadataPointer;
  matchingDistribution: MatchingStatsData[];
}> {
  try {
    let matchingDistribution: MatchingStatsData[] = [];
    const roundImplementation = new ethers.Contract(
      roundId,
      roundImplementationContract.abi
    );
    const payoutStrategyAddress = await roundImplementation.payoutStrategy();
    const payoutStrategy = new ethers.Contract(
      payoutStrategyAddress,
      payoutStrategyContract.abi
    );
    const distributionMetaPtr = await payoutStrategy.distributionMetaPtr();

    if (distributionMetaPtr.pointer !== "0x") {
      // fetch distribution from IPFS
      const matchingDistributionRes = await fetchFromIPFS(
        distributionMetaPtr.pointer
      );
      matchingDistribution = matchingDistributionRes.matchingDistribution;
    }

    return { distributionMetaPtr, matchingDistribution };
  } catch (error) {
    console.error("fetchMatchingDistribution", error);
    throw new Error("Unable to fetch matching distribution");
  }
}
