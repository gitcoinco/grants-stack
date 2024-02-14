/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signer } from "@ethersproject/abstract-signer";
import { TransactionResponse, Web3Provider } from "@ethersproject/providers";
import { graphql_fetch } from "common";
import { BigNumber, ethers, utils } from "ethers";
import {
  merklePayoutStrategyImplementationContract,
  roundFactoryContract,
  roundImplementationContract,
} from "./contracts";
import {
  ApplicationStatus,
  ApprovedProject,
  MatchingStatsData,
  MetadataPointer,
  Round,
} from "./types";
import { fetchFromIPFS } from "./utils";
import { maxDateForUint256 } from "../../constants";
import { payoutTokens } from "./payoutTokens";
import { Address } from "wagmi";
import { DataLayer, V2RoundWithRoles } from "data-layer";

export enum UpdateAction {
  UPDATE_APPLICATION_META_PTR = "updateApplicationMetaPtr",
  UPDATE_ROUND_META_PTR = "updateRoundMetaPtr",
  UPDATE_ROUND_START_AND_END_TIMES = "updateStartAndEndTimes",
  UPDATE_MATCH_AMOUNT = "updateMatchAmount",
  UPDATE_ROUND_FEE_ADDRESS = "updateRoundFeeAddress",
  UPDATE_ROUND_FEE_PERCENTAGE = "updateRoundFeePercentage",
}

export class TransactionBuilder {
  round: Round;
  signer: Signer;
  transactions: any[];
  contract: any;

  constructor(round: Round, signer: Signer) {
    this.round = round;
    this.signer = signer;
    this.transactions = [];
    if (round.id) {
      this.contract = new ethers.Contract(
        round.id,
        roundImplementationContract.abi,
        signer
      );
    } else {
      throw new Error("Round ID is undefined");
    }
  }

  add(action: any, args: any[]) {
    this.transactions.push(
      this.contract.interface.encodeFunctionData(action, args)
    );
  }

  async execute(): Promise<TransactionResponse> {
    if (this.transactions.length === 0) {
      throw new Error("No transactions to execute");
    }
    return await this.contract.multicall(this.transactions);
  }

  getTransactions() {
    return this.transactions;
  }
}

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

    // query the subgraph for all rounds by  the given address in the given program
    let res = await graphql_fetch(
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
                strategyName
                type: __typename
                ... on DirectPayout {
                  vaultAddress
                }
                ... on MerklePayout {
                  isReadyForPayout
                }
              }
            }
          }
        `,
      chainId,
      { roundId: roundId }
    );

    if (res.errors !== undefined) {
      // FIXME: remove this part after all the subgraphs have been deployed
      // try the old query
      res = await graphql_fetch(
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
    }

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
    const protocolFeePercentage =
      res.data.alloSettings && res.data.alloSettings[0]
        ? res.data.alloSettings[0].protocolFeePercentage / DENOMINATOR
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
      applicationsEndTime:
        round.applicationsEndTime == ethers.constants.MaxUint256.toString()
          ? maxDateForUint256
          : new Date(Number(round.applicationsEndTime) * 1000),
      roundStartTime: new Date(Number(round.roundStartTime) * 1000),
      roundEndTime:
        round.applicationsEndTime == ethers.constants.MaxUint256.toString()
          ? maxDateForUint256
          : new Date(Number(round.roundEndTime) * 1000),
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

function indexerV2RoundToRound(round: V2RoundWithRoles): Round {
  const operatorWallets = round.roles.map(
    (account: { address: string }) => account.address
  );

  return {
    id: round.id,
    roundMetadata: round.roundMetadata as Round["roundMetadata"],
    applicationMetadata:
      round.applicationMetadata as unknown as Round["applicationMetadata"],
    applicationsStartTime: new Date(round.applicationsStartTime),
    applicationsEndTime:
      round.applicationsEndTime === null
        ? maxDateForUint256
        : new Date(round.applicationsEndTime),
    roundStartTime: new Date(round.donationsStartTime),
    roundEndTime:
      round.donationsEndTime === null
        ? maxDateForUint256
        : new Date(round.donationsEndTime),
    token: round.matchTokenAddress,
    votingStrategy: "unknown",
    payoutStrategy: {
      id: round.strategyAddress,
      isReadyForPayout: false,
      strategyName:
        round.strategyName === "allov1.Direct" ? "DIRECT" : "MERKLE",
    },
    ownedBy: round.projectId,
    operatorWallets: operatorWallets,
    finalized: false,
  };
}

/**
 * Fetch a list of rounds
 */
export async function listRounds(args: {
  chainId: number;
  userAddress: Address;
  dataLayer: DataLayer;
  programId: string;
}): Promise<{ rounds: Round[] }> {
  const { chainId, userAddress, dataLayer, programId } = args;

  const rounds = await dataLayer
    .getRoundsByProgramIdAndUserAddress({
      chainId: chainId,
      programId,
      userAddress,
    })
    .then((rounds) => rounds.map(indexerV2RoundToRound));

  return { rounds };
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
  signerOrProvider: Signer,
  isQF: boolean
): Promise<{ transactionBlockNumber: number }> {
  try {
    const chainId = await signerOrProvider.getChainId();

    if (isQF) {
      /* Validate and prepare round data*/
      if (!round.applicationsEndTime) {
        round.applicationsEndTime = round.roundStartTime;
      }
    }
    round.operatorWallets = round.operatorWallets?.filter((e) => e !== "");

    const _roundFactoryContract = roundFactoryContract(chainId);
    const roundFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _roundFactoryContract.address!,
      _roundFactoryContract.abi,
      signerOrProvider
    );

    const initAddresses = [round.votingStrategy, round.payoutStrategy.id];

    let initRoundTimes: string[] = [];
    const formatDate = (date: Date) => (date.getTime() / 1000).toString();
    if (isQF) {
      if (round.applicationsEndTime === undefined) {
        round.applicationsEndTime = round.roundStartTime;
      }
      initRoundTimes = [
        formatDate(round.applicationsStartTime),
        formatDate(round.applicationsEndTime),
        formatDate(round.roundStartTime),
        formatDate(round.roundEndTime),
      ];
    } else {
      // note: DirectRounds does not set application dates.
      // in those cases, we set:
      // application start time with the round start time
      // application end time with MaxUint256.
      // if the round has not end time, we set it with MaxUint256.

      initRoundTimes = [
        formatDate(round.applicationsStartTime ?? round.roundStartTime),
        round.applicationsEndTime
          ? formatDate(round.applicationsEndTime)
          : round.roundEndTime
          ? formatDate(round.roundEndTime)
          : ethers.constants.MaxUint256.toString(),
        formatDate(round.roundStartTime),
        round.roundEndTime
          ? formatDate(round.roundEndTime)
          : ethers.constants.MaxUint256.toString(),
      ];
    }

    const initMetaPtr = [round.store, round.applicationStore];

    const initRoles = [
      [await signerOrProvider.getAddress()],
      round.operatorWallets,
    ];

    const token = ethers.constants.AddressZero;
    let parsedTokenAmount = ethers.constants.Zero;

    if (isQF) {
      // Ensure tokenAmount is normalized to token decimals
      const tokenAmount =
        round.roundMetadata.quadraticFundingConfig?.matchingFundsAvailable ?? 0;
      const pyToken = payoutTokens.filter(
        (t) => t.address.toLowerCase() === round.token.toLowerCase()
      )[0];
      parsedTokenAmount = utils.parseUnits(
        tokenAmount.toString(),
        pyToken.decimal
      );
    }

    // encode input parameters
    const params = [
      initAddresses,
      initRoundTimes,
      parsedTokenAmount,
      isQF ? round.token : token,
      round.feesPercentage || 0,
      round.feesAddress || ethers.constants.AddressZero,
      initMetaPtr,
      initRoles,
    ];

    const encodedParameters = ethers.utils.defaultAbiCoder.encode(
      [
        "tuple(address votingStrategy, address payoutStrategy)",
        "tuple(uint256 applicationsStartTime, uint256 applicationsEndTime, uint256 roundStartTime, uint256 roundEndTime)",
        "uint256",
        "address",
        "uint8",
        "address",
        "tuple(tuple(uint256 protocol, string pointer), tuple(uint256 protocol, string pointer))",
        "tuple(address[] adminRoles, address[] roundOperators)",
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

/**
 * Fetch finalized matching distribution
 * @param roundId - the ID of a specific round for detail
 * @param signerOrProvider
 */
export async function fetchMatchingDistribution(
  roundId: string | undefined,
  signerOrProvider: Web3Provider
): Promise<{
  distributionMetaPtr: string;
  matchingDistribution: MatchingStatsData[];
}> {
  try {
    if (!roundId) {
      throw new Error("Round ID is required");
    }
    let matchingDistribution: MatchingStatsData[] = [];
    const roundImplementation = new ethers.Contract(
      roundId,
      roundImplementationContract.abi,
      signerOrProvider
    );
    const payoutStrategyAddress = await roundImplementation.payoutStrategy();
    const payoutStrategy = new ethers.Contract(
      payoutStrategyAddress,
      merklePayoutStrategyImplementationContract.abi,
      signerOrProvider
    );
    const distributionMetaPtrRes = await payoutStrategy.distributionMetaPtr();
    const distributionMetaPtr = distributionMetaPtrRes.pointer;

    if (distributionMetaPtr !== "") {
      // fetch distribution from IPFS
      const matchingDistributionRes = await fetchFromIPFS(distributionMetaPtr);
      matchingDistribution = matchingDistributionRes.matchingDistribution;

      // parse matchAmountInToken to a valid BigNumber
      matchingDistribution.map((distribution) => {
        distribution.matchAmountInToken = BigNumber.from(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (distribution.matchAmountInToken as any).hex
        );
      });
    }

    return { distributionMetaPtr, matchingDistribution };
  } catch (error) {
    console.error("fetchMatchingDistribution", error);
    throw new Error("Unable to fetch matching distribution");
  }
}

/**
 * Pay Protocol & Round Fees and transfer funds to payout contract (only by ROUND_OPERATOR_ROLE)
 * @param roundId
 * @param signerOrProvider
 * @returns
 */
export const setReadyForPayout = async ({
  roundId,
  signerOrProvider,
}: {
  roundId: string;
  signerOrProvider: Signer;
}): Promise<TransactionResponse> => {
  const roundImplementation = new ethers.Contract(
    roundId,
    roundImplementationContract.abi,
    signerOrProvider
  );

  const tx = await roundImplementation.setReadyForPayout();
  return tx.wait();
};
