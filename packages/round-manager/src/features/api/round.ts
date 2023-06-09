import { ChainId, graphql_fetch } from "common";
import { roundFactoryContract } from "./contracts";
import {
  ApplicationStatus,
  ApprovedProject,
  MatchingStatsData,
  MetadataPointer,
  Round,
} from "./types";
import { fetchFromIPFS, payoutTokens } from "./utils";
import {
  decodeEventLog,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  getContract,
  GetContractReturnType,
  Hex,
  parseAbiParameters,
  parseUnits,
  PublicClient,
  zeroAddress,
} from "viem";
import { WalletClient } from "wagmi";
import { waitForTransaction } from "@wagmi/core";
import RoundFactoryABI from "./abi/RoundFactoryABI";
import RoundImplementationABI from "./abi/RoundImplementationABI";
import {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";
import MerklePayoutStrategyImplementationABI from "./abi/payoutStrategy/MerklePayoutStrategyImplementationABI";
import { FinalizedMatches, RevisedMatch } from "../round/ViewRoundResults";

export class TransactionBuilder {
  round: Round;
  walletClient: WalletClient;
  transactions: Hex[];
  contract: GetContractReturnType<
    typeof RoundImplementationABI,
    null,
    WalletClient
  >;

  constructor(round: Round, walletClient: WalletClient) {
    this.round = round;
    this.walletClient = walletClient;
    this.transactions = [];
    if (round.id) {
      this.contract = getContract({
        address: round.id as Hex,
        abi: RoundImplementationABI,
        walletClient,
      });
    } else {
      throw new Error("Round ID is undefined");
    }
  }

  add<
    TAbi extends typeof RoundImplementationABI,
    TFunctionName extends ExtractAbiFunctionNames<TAbi>,
    TAbiFunction extends AbiFunction = ExtractAbiFunction<TAbi, TFunctionName>
  >(
    functionName: TFunctionName | ExtractAbiFunctionNames<TAbi>,
    args: AbiParametersToPrimitiveTypes<TAbiFunction["inputs"], "inputs">
  ) {
    this.transactions.push(
      // @ts-expect-error viem internal type error
      encodeFunctionData<TAbi, TFunctionName>({
        abi: RoundImplementationABI,
        functionName,
        args,
      })
    );
  }

  async execute() {
    if (this.transactions.length === 0) {
      throw new Error("No transactions to execute");
    }
    const contract = getContract({
      address: this.round.id as Hex,
      abi: RoundImplementationABI,
      walletClient: this.walletClient,
    });
    const tx = await contract.write.multicall([this.transactions]);
    return await waitForTransaction({
      hash: tx,
    });
  }

  getTransactions() {
    return this.transactions;
  }
}

/**
 * Fetch a round by ID
 * @param publicClient - provider
 * @param roundId - the ID of a specific round for detail
 */
export async function getRoundById(
  publicClient: PublicClient,
  roundId: string
): Promise<Round> {
  try {
    // fetch chain id
    const chainId = await publicClient.getChainId();

    // query the subgraph for all rounds by the given address in the given program
    const res = await graphql_fetch(
      `
          query GetRounds($roundId: String) {

            alloSettings(id:"1") {
              protocolFeePercentage
            }

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
              roundFeePercentage
              token
              projectsMetaPtr {
                pointer
              }
              projects(first: 1000) {
                id
                project
                status
                applicationIndex
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
              payoutStrategy {
                id
                isReadyForPayout
              }
            }
          }
        `,
      chainId,
      { roundId: roundId }
    );

    const round: RoundResult = res.data.rounds[0];

    // fetch round and application metadata from IPFS
    const [roundMetadata, applicationMetadata] = await Promise.all([
      fetchFromIPFS(res.data.rounds[0].roundMetaPtr.pointer),
      fetchFromIPFS(res.data.rounds[0].applicationMetaPtr.pointer),
    ]);

    round.projects = round.projects.map((project) => {
      return {
        ...project,
        status: convertStatus(project.status),
      };
    });

    const approvedProjectsWithMetadata = await loadApprovedProjects(
      round,
      chainId
    );

    const operatorWallets = res.data.rounds[0].roles[0].accounts.map(
      (account: { address: string }) => account.address
    );

    const DENOMINATOR = 100000;

    const protocolFeePercentage = res.data.alloSettings
      ? res.data.alloSettings.protocolFeePercentage / DENOMINATOR
      : 0;

    const roundFeePercentage =
      res.data.rounds[0].roundFeePercentage / DENOMINATOR;

    return {
      id: round.id,
      chainId: chainId,
      roundMetadata,
      applicationMetadata,
      applicationsStartTime: new Date(
        Number(round.applicationsStartTime) * 1000
      ),
      applicationsEndTime: new Date(Number(round.applicationsEndTime) * 1000),
      roundStartTime: new Date(Number(round.roundStartTime) * 1000),
      roundEndTime: new Date(Number(round.roundEndTime) * 1000),
      protocolFeePercentage: protocolFeePercentage,
      roundFeePercentage: roundFeePercentage,
      token: round.token,
      votingStrategy: res.data.rounds[0].votingStrategy,
      payoutStrategy: res.data.rounds[0].payoutStrategy,
      ownedBy: round.program.id,
      operatorWallets: operatorWallets,
      approvedProjects: approvedProjectsWithMetadata,
      finalized: false,
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
  signerOrProvider: PublicClient,
  programId: string,
  roundId?: string
): Promise<{ rounds: Round[] }> {
  try {
    // fetch chain id
    const chainId = await signerOrProvider.getChainId();

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
        finalized: false,
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
 * @param walletClient
 * @returns
 */
export async function deployRoundContract(
  round: Round,
  walletClient: WalletClient
): Promise<{ transactionBlockNumber: bigint }> {
  try {
    const chainId = await walletClient.getChainId();
    const addresses = await walletClient.getAddresses();

    const _roundFactoryContract = roundFactoryContract(chainId);
    const roundFactory = getContract({
      address: _roundFactoryContract.address as Hex,
      abi: RoundFactoryABI,
      walletClient,
    });

    if (!round.applicationsEndTime) {
      round.applicationsEndTime = round.roundStartTime;
    }

    round.operatorWallets = round.operatorWallets?.filter((e) => e !== "");

    const initAddresses = [round.votingStrategy, round.payoutStrategy.id];

    const initRoundTimes = [
      new Date(round.applicationsStartTime).getTime() / 1000,
      new Date(round.applicationsEndTime).getTime() / 1000,
      new Date(round.roundStartTime).getTime() / 1000,
      new Date(round.roundEndTime).getTime() / 1000,
    ];

    // Ensure tokenAmount is normalized to token decimals
    const tokenAmount =
      round.roundMetadata.quadraticFundingConfig?.matchingFundsAvailable || 0;
    const token = payoutTokens.filter(
      (t) => t.address.toLocaleLowerCase() == round.token.toLocaleLowerCase()
    )[0];
    const parsedTokenAmount = parseUnits(
      tokenAmount.toString() as `${number}`,
      token.decimal
    );

    const encodedParameters = encodeAbiParameters(
      parseAbiParameters(
        "(address votingStrategy, address payoutStrategy),(uint256 applicationsStartTime, uint256 applicationsEndTime, uint256 roundStartTime, uint256 roundEndTime),uint256,address,uint8,address,((uint256 protocol, string pointer),(uint256 protocol, string pointer)),(address[] adminRoles, address[] roundOperators)"
      ),
      [
        {
          votingStrategy: initAddresses[0] as Hex,
          payoutStrategy: initAddresses[1] as Hex,
        },
        {
          applicationsStartTime: BigInt(initRoundTimes[0]),
          applicationsEndTime: BigInt(initRoundTimes[1]),
          roundStartTime: BigInt(initRoundTimes[2]),
          roundEndTime: BigInt(initRoundTimes[3]),
        },
        parsedTokenAmount,
        round.token as Hex,
        round.feesPercentage || 0,
        (round.feesAddress || zeroAddress) as Hex,
        [
          {
            protocol: BigInt(round.store?.protocol ?? 1),
            pointer: round.store?.pointer ?? "",
          },
          {
            protocol: BigInt(round.applicationStore?.protocol ?? 1),
            pointer: round.applicationStore?.pointer ?? "",
          },
        ],
        {
          adminRoles: [addresses[0]],
          roundOperators: round.operatorWallets as Hex[],
        },
      ]
    );

    // Deploy a new Round contract
    const tx = await roundFactory.write.create([
      encodedParameters,
      round.ownedBy as Hex,
    ]);

    const receipt = await waitForTransaction({
      hash: tx,
    });

    let roundAddress;
    receipt.logs
      .map((log) => {
        try {
          return decodeEventLog({ ...log, abi: RoundFactoryABI });
        } catch {
          /* This tx receipt also captures events emitted from the RoundImplementation,
          so we try parsing it using RoundpImplementation */
          return decodeEventLog({ ...log, abi: RoundImplementationABI });
        }
      })
      .find((log) => {
        if (log.eventName === "RoundCreated") {
          roundAddress = log.args.roundAddress;
        }
      });

    console.log("✅ Round Contract Transaction hash: ", tx);
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
  status: string | number;
  applicationIndex: number;
  metaPtr: MetadataPointer;
}

function convertStatus(status: string | number) {
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

async function loadApprovedProjects(
  round: RoundResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainId: any
): Promise<ApprovedProject[]> {
  if (!round.projectsMetaPtr || round.projects.length === 0) {
    return [];
  }
  const allRoundProjects = round.projects;

  const approvedProjects = allRoundProjects.filter(
    (project) => project.status === ApplicationStatus.APPROVED
  );
  const fetchApprovedProjectMetadata: Promise<ApprovedProject>[] =
    approvedProjects.map((project: RoundProjectResult) =>
      fetchMetadataAndMapProject(project, chainId)
    );
  return Promise.all(fetchApprovedProjectMetadata);
}

async function fetchMetadataAndMapProject(
  project: RoundProjectResult,
  chainId: ChainId
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
  chainId: ChainId,
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

/**
 * Fetch finalized matching distribution
 * @param roundId - the ID of a specific round for detail
 * @param publicClient
 */
export async function fetchMatchingDistribution(
  roundId: string,
  publicClient: PublicClient
): Promise<{
  distributionMetaPtr: string;
  matchingDistribution: MatchingStatsData[];
}> {
  try {
    let matchingDistribution: MatchingStatsData[] = [];
    const roundImplementation = getContract({
      address: roundId as Hex,
      abi: RoundImplementationABI,
      publicClient,
    });
    const payoutStrategyAddress =
      await roundImplementation.read.payoutStrategy();
    const payoutStrategy = getContract({
      address: payoutStrategyAddress as Hex,
      abi: MerklePayoutStrategyImplementationABI,
      publicClient,
    });
    const distributionMetaPtrRes =
      await payoutStrategy.read.distributionMetaPtr();
    const distributionMetaPtr = distributionMetaPtrRes[1];

    if (distributionMetaPtr !== "") {
      const matchingDistributionRes = await fetchFromIPFS(distributionMetaPtr);
      matchingDistribution = matchingDistributionRes.matchingDistribution;

      /* TODO: use viem to deserialize bigints here */
      matchingDistribution.map((distribution) => {
        distribution.matchAmountInToken = BigInt(
          distribution.matchAmountInToken
        );
      });
    }

    return { distributionMetaPtr, matchingDistribution };
  } catch (error) {
    console.error("fetchMatchingDistribution", error);
    throw new Error("Unable to fetch matching distribution");
  }
}

export async function fetchFinalizedMatches(
  roundId: string,
  publicClient: PublicClient
): Promise<FinalizedMatches | undefined> {
  const roundImplementation = getContract({
    address: roundId as Hex,
    abi: RoundImplementationABI,
    publicClient,
  });

  const payoutFilter =
    await roundImplementation.createEventFilter.PayFeeAndEscrowFundsToPayoutContract(
      {
        fromBlock: BigInt(0),
        toBlock: "latest",
      }
    );

  const payoutEvents = await publicClient.getFilterLogs({
    filter: payoutFilter,
  });

  if (payoutEvents.length > 0) {
    const readyForPayoutTransactionHash = payoutEvents[0].transactionHash ?? "";

    const payoutStrategyAddress =
      await roundImplementation.read.payoutStrategy();

    const payoutStrategy = getContract({
      address: payoutStrategyAddress,
      abi: MerklePayoutStrategyImplementationABI,
      publicClient,
    });

    const distributionMetaPtr = await payoutStrategy.read.distributionMetaPtr();

    const distribution = await fetchFromIPFS(distributionMetaPtr[1]);

    const distributionMatches =
      distribution.matchingDistribution as MatchingStatsData[];

    const matches: RevisedMatch[] = distributionMatches.map((m) => {
      return {
        applicationId: m.applicationId,
        payoutAddress: m.projectPayoutAddress,
        projectId: m.projectId,
        projectName: m.projectName,
        contributionsCount: 0,
        revisedContributionCount: m.contributionsCount,
        matched: m.originalMatchAmountInToken,
        revisedMatch: m.matchAmountInToken,
      };
    });

    return {
      readyForPayoutTransactionHash,
      matches,
    };
  }

  return undefined;
}
