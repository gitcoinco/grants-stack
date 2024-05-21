import {
  AlloAbi,
  Allo as AlloV2Contract,
  CreateProfileArgs,
  DirectGrantsLiteStrategy,
  DirectGrantsLiteStrategyTypes,
  DonationVotingMerkleDistributionDirectTransferStrategyAbi,
  DonationVotingMerkleDistributionStrategy,
  DonationVotingMerkleDistributionStrategyTypes,
  Registry,
  RegistryAbi,
  TransactionData,
} from "@allo-team/allo-v2-sdk";
import MRC_ABI from "../abis/allo-v1/multiRoundCheckout";
import { MRC_CONTRACTS } from "../addresses/mrc";
import { CreatePoolArgs, NATIVE } from "@allo-team/allo-v2-sdk/dist/types";
import {
  ApplicationStatus,
  DistributionMatch,
  RoundApplicationAnswers,
  RoundCategory,
} from "data-layer";
import { Abi, Address, Hex, PublicClient, getAddress, zeroAddress } from "viem";
import { AnyJson, ChainId } from "../..";
import { UpdateRoundParams, MatchingStatsData } from "../../types";
import { Allo, AlloError, AlloOperation, CreateRoundArguments } from "../allo";
import {
  Result,
  UINT64_MAX,
  dateToEthereumTimestamp,
  error,
  success,
} from "../common";
import { WaitUntilIndexerSynced } from "../indexer";
import { IpfsUploader } from "../ipfs";
import {
  TransactionReceipt,
  TransactionSender,
  decodeEventFromReceipt,
  sendRawTransaction,
  sendTransaction,
} from "../transaction-sender";
import { PermitSignature, getPermitType } from "../voting";
import Erc20ABI from "../abis/erc20";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { buildUpdatedRowsOfApplicationStatuses } from "../application";
import { BigNumber, utils } from "ethers";
import { Distribution } from "@allo-team/allo-v2-sdk/dist/strategies/DonationVotingMerkleDistributionStrategy/types";
import { TToken } from "@grants-labs/gitcoin-chain-data/dist/types";

function getStrategyAddress(strategy: RoundCategory, chainId: ChainId): string {
  let strategyAddresses;
  switch (chainId) {
    case ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID:
    case ChainId.ZKSYNC_ERA_TESTNET_CHAIN_ID:
      strategyAddresses = {
        [RoundCategory.QuadraticFunding]:
          "0x61E288cf14f196CF8a6104ec421ae17c7f16a749",
        [RoundCategory.Direct]: "0x9710eedFD45a2ce5E6b09303a1E51c0cd600Fc88",
      };
      break;

    case ChainId.SEI_DEVNET:
      strategyAddresses = {
        [RoundCategory.QuadraticFunding]:
          "0x029dFAf686DfA0efdace5132ba422e9279D50b5b",
        [RoundCategory.Direct]: "0xdA62767Da1402398d81C8288b37DE1CC8C8fDcA0",
      };
      break;

    case ChainId.LUKSO:
      strategyAddresses = {
        [RoundCategory.QuadraticFunding]:
          "0x91b5eeE385D8e0cfd49FD94D4C7aE15e1F17e0A2",
        [RoundCategory.Direct]: "0xF21E0915a0b7c541483962Cc7fB4705bBd4D5248",
      };
      break;

    case ChainId.LUKSO_TESTNET:
      strategyAddresses = {
        [RoundCategory.QuadraticFunding]:
          "0x91b5eeE385D8e0cfd49FD94D4C7aE15e1F17e0A2",
        [RoundCategory.Direct]: "0xdA62767Da1402398d81C8288b37DE1CC8C8fDcA0",
      };
      break;

    default:
      strategyAddresses = {
        [RoundCategory.QuadraticFunding]:
          "0x787eC93Dd71a90563979417879F5a3298389227f",
        [RoundCategory.Direct]: "0x79A5EEc2C87Cd2116195E71af7A38647f89C8Ffa",
      };
      break;
  }
  return strategyAddresses[strategy];
}

function applicationStatusToNumber(status: ApplicationStatus) {
  switch (status) {
    case "PENDING":
      return 1n;
    case "APPROVED":
      return 2n;
    case "REJECTED":
      return 3n;
    case "APPEAL":
      return 4n;
    case "IN_REVIEW":
      return 5n;
    case "CANCELLED":
      return 6n;

    default:
      throw new Error(`Unknown status ${status}`);
  }
}

export function getAlloAddress(chainId: ChainId) {
  const allo = new AlloV2Contract({
    chain: chainId,
  });
  return allo.address();
}

export class AlloV2 implements Allo {
  private transactionSender: TransactionSender;
  private ipfsUploader: IpfsUploader;
  private waitUntilIndexerSynced: WaitUntilIndexerSynced;
  private chainId: number;
  private registry: Registry;
  private allo: AlloV2Contract;

  constructor(args: {
    chainId: number;
    transactionSender: TransactionSender;
    ipfsUploader: IpfsUploader;
    waitUntilIndexerSynced: WaitUntilIndexerSynced;
  }) {
    this.chainId = args.chainId;
    this.transactionSender = args.transactionSender;
    this.ipfsUploader = args.ipfsUploader;
    this.waitUntilIndexerSynced = args.waitUntilIndexerSynced;

    this.registry = new Registry({
      chain: this.chainId,
    });
    this.allo = new AlloV2Contract({
      chain: this.chainId,
    });
  }

  async donate(
    publicClient: PublicClient,
    chainId: ChainId,
    token: TToken,
    groupedVotes: Record<string, Hex[]>,
    groupedAmounts: Record<string, bigint> | bigint[],
    nativeTokenAmount: bigint,
    permit?: {
      sig: PermitSignature;
      deadline: number;
      nonce: bigint;
    }
  ) {
    let tx: Result<Hex>;
    const mrcAddress = MRC_CONTRACTS[chainId];

    const poolIds = Object.keys(groupedVotes).flatMap((key) => {
      const count = groupedVotes[key].length;
      return new Array(count).fill(key);
    });

    const data = Object.values(groupedVotes).flat();

    /* decide which function to use based on whether token is native, permit-compatible or DAI */
    if (token.address === zeroAddress || token.address === NATIVE) {
      tx = await sendTransaction(this.transactionSender, {
        address: mrcAddress,
        abi: MRC_ABI,
        functionName: "allocate",
        args: [poolIds, Object.values(groupedAmounts), data],
        value: nativeTokenAmount,
      });
    } else if (permit) {
      if (getPermitType(token) === "dai") {
        tx = await sendTransaction(this.transactionSender, {
          address: mrcAddress,
          abi: MRC_ABI,
          functionName: "allocateDAIPermit",
          args: [
            data,
            poolIds,
            Object.values(groupedAmounts),
            Object.values(groupedAmounts).reduce((acc, b) => acc + b),
            token.address as Hex,
            BigInt(permit.deadline ?? Number.MAX_SAFE_INTEGER),
            permit.nonce,
            permit.sig.v,
            permit.sig.r as Hex,
            permit.sig.s as Hex,
          ],
        });
      } else {
        tx = await sendTransaction(this.transactionSender, {
          address: mrcAddress,
          abi: MRC_ABI,
          functionName: "allocateERC20Permit",
          args: [
            data,
            poolIds,
            Object.values(groupedAmounts),
            Object.values(groupedAmounts).reduce((acc, b) => acc + b),
            token.address as Hex,
            BigInt(permit.deadline ?? Number.MAX_SAFE_INTEGER),
            permit.sig.v,
            permit.sig.r as Hex,
            permit.sig.s as Hex,
          ],
        });
      }
    } else {
      /* Tried voting using erc-20 but no permit signature provided */
      throw new AlloError(
        "Tried voting using erc-20 but no permit signature provided"
      );
    }

    if (tx.type === "success") {
      const receipt = await this.transactionSender.wait(
        tx.value,
        60_000,
        publicClient
      );
      return receipt;
    } else {
      throw tx.error;
    }
  }

  createProject(args: {
    name: string;
    metadata: AnyJson;
    memberAddresses: Address[];
    nonce?: bigint;
  }): AlloOperation<
    Result<{ projectId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      /** upload metadata to IPFS */
      const ipfsResult = await this.ipfsUploader(args.metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      const profileNonce = args.nonce
        ? args.nonce
        : BigInt(Math.floor(Math.random() * 1000000) + 1000000);

      const senderAddress = await this.transactionSender.address();

      const createProfileData: CreateProfileArgs = {
        nonce: BigInt(profileNonce),
        name: args.name,
        metadata: {
          protocol: 1n,
          pointer: ipfsResult.value,
        },
        owner: senderAddress,
        members: args.memberAddresses.filter(
          (address) => address !== senderAddress
        ),
      };

      const txCreateProfile: TransactionData =
        this.registry.createProfile(createProfileData);

      /** send transaction to create project */
      const txResult = await sendRawTransaction(this.transactionSender, {
        to: txCreateProfile.to,
        data: txCreateProfile.data,
        value: BigInt(txCreateProfile.value),
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      /** wait for transaction to be mined */
      let receipt: TransactionReceipt;

      try {
        receipt = await this.transactionSender.wait(txResult.value);

        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to create project");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(void 0));

      const projectCreatedEvent = decodeEventFromReceipt({
        abi: RegistryAbi as Abi,
        receipt,
        event: "ProfileCreated",
      }) as { profileId: Hex };

      return success({
        projectId: projectCreatedEvent.profileId,
      });
    });
  }

  createProgram(args: {
    name: string;
    memberAddresses: Address[];
  }): AlloOperation<
    Result<{ programId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return this.createProject({
      name: args.name,
      metadata: {
        type: "program",
        name: args.name,
      },
      memberAddresses: args.memberAddresses,
    }).map((result) => {
      if (result.type === "success") {
        return success({
          programId: result.value.projectId,
        });
      }

      return result;
    });
  }

  updateProjectMetadata(args: {
    projectId: Hex;
    metadata: AnyJson;
  }): AlloOperation<
    Result<{ projectId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      const projectId = args.projectId;

      /** upload metadata to IPFS */
      const ipfsResult = await this.ipfsUploader(args.metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      const data = {
        profileId: projectId,
        metadata: {
          protocol: 1n,
          pointer: ipfsResult.value,
        },
      };

      const txUpdateProfile: TransactionData =
        this.registry.updateProfileMetadata(data);

      /** send transaction to create project */
      const txResult = await sendRawTransaction(this.transactionSender, {
        to: txUpdateProfile.to,
        data: txUpdateProfile.data,
        value: BigInt(txUpdateProfile.value),
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      /** wait for transaction to be mined */
      let receipt: TransactionReceipt;

      try {
        receipt = await this.transactionSender.wait(txResult.value);

        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to update project metadata");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(void 0));

      return success({
        projectId: projectId,
      });
    });
  }

  createRound(args: CreateRoundArguments): AlloOperation<
    Result<{ roundId: Hex }>,
    {
      ipfsStatus: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      const roundIpfsResult = await this.ipfsUploader({
        round: args.roundData.roundMetadataWithProgramContractAddress,
        application: args.roundData.applicationQuestions,
      });

      emit("ipfsStatus", roundIpfsResult);

      if (roundIpfsResult.type === "error") {
        return roundIpfsResult;
      }

      let initStrategyDataEncoded: Address;
      let token: Address = getAddress(NATIVE);

      if (args.roundData.roundCategory === RoundCategory.QuadraticFunding) {
        const initStrategyData: DonationVotingMerkleDistributionStrategyTypes.InitializeData =
          {
            useRegistryAnchor: true,
            metadataRequired: true,
            registrationStartTime: dateToEthereumTimestamp(
              args.roundData.applicationsStartTime
            ), // in seconds, must be in future
            registrationEndTime: dateToEthereumTimestamp(
              args.roundData.applicationsEndTime
            ), // in seconds, must be after registrationStartTime
            allocationStartTime: dateToEthereumTimestamp(
              args.roundData.roundStartTime
            ), // in seconds, must be after registrationStartTime
            allocationEndTime: dateToEthereumTimestamp(
              args.roundData.roundEndTime
            ), // in seconds, must be after allocationStartTime
            allowedTokens: [], // allow all tokens
          };

        const strategy = new DonationVotingMerkleDistributionStrategy({
          chain: this.chainId,
        });

        initStrategyDataEncoded =
          await strategy.getInitializeData(initStrategyData);

        const alloToken =
          args.roundData.token === zeroAddress ? NATIVE : args.roundData.token;

        token = getAddress(alloToken);
      } else if (args.roundData.roundCategory === RoundCategory.Direct) {
        const initStrategyData: DirectGrantsLiteStrategyTypes.InitializeData = {
          useRegistryAnchor: true,
          metadataRequired: true,
          registrationStartTime: dateToEthereumTimestamp(
            args.roundData.roundStartTime
          ),
          registrationEndTime: args.roundData.roundEndTime
            ? dateToEthereumTimestamp(args.roundData.roundEndTime)
            : UINT64_MAX, // in seconds, must be after registrationStartTime
        };

        const strategy = new DirectGrantsLiteStrategy({
          chain: this.chainId,
        });

        initStrategyDataEncoded =
          await strategy.getInitializeData(initStrategyData);
      } else {
        throw new Error(
          `Unsupported round type ${args.roundData.roundCategory}`
        );
      }

      const profileId = args.roundData.roundMetadataWithProgramContractAddress
        ?.programContractAddress as `0x${string}`;

      if (!profileId || !profileId.startsWith("0x")) {
        throw new Error("Program contract address is required");
      }

      const createPoolArgs: CreatePoolArgs = {
        profileId: profileId as Hex,
        strategy: getStrategyAddress(
          args.roundData.roundCategory,
          this.chainId
        ),
        initStrategyData: initStrategyDataEncoded,
        token,
        amount: 0n, // we send 0 tokens to the pool, we fund it later
        metadata: { protocol: 1n, pointer: roundIpfsResult.value },
        managers: (args.roundData.roundOperators ?? []).map((operator) =>
          getAddress(operator)
        ),
      };

      const txData = this.allo.createPool(createPoolArgs);

      const txResult = await sendRawTransaction(this.transactionSender, {
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value),
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      // --- wait for transaction to be mined
      let receipt: TransactionReceipt;
      let poolCreatedEvent;

      try {
        receipt = await this.transactionSender.wait(txResult.value);

        poolCreatedEvent = decodeEventFromReceipt({
          abi: AlloAbi as Abi,
          receipt,
          event: "PoolCreated",
        }) as { poolId: Hex };

        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to create Pool", err);
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(void 0));

      return success({
        roundId: poolCreatedEvent.poolId,
      });
    });
  }

  /**
   * Applies to a round for Allo v2
   *
   * @param args
   *
   * @public
   *
   * @returns AllotOperation<Result<Hex>, { ipfs: Result<string>; transaction: Result<Hex>; transactionStatus: Result<TransactionReceipt> }>
   */
  applyToRound(args: {
    projectId: Hex;
    roundId: Hex | number;
    metadata: AnyJson;
    strategy?: RoundCategory;
  }): AlloOperation<
    Result<Hex>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      if (typeof args.roundId != "number") {
        return error(new AlloError("roundId must be number"));
      }

      const ipfsResult = await this.ipfsUploader(args.metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      const metadata = args.metadata as unknown as {
        application: { recipient: Hex; answers: RoundApplicationAnswers[] };
      };

      let registerRecipientTx: TransactionData;

      switch (args.strategy) {
        case RoundCategory.QuadraticFunding: {
          const strategyInstance = new DonationVotingMerkleDistributionStrategy(
            {
              chain: this.chainId,
              poolId: BigInt(args.roundId),
            }
          );

          registerRecipientTx = strategyInstance.getRegisterRecipientData({
            registryAnchor: args.projectId,
            recipientAddress: metadata.application.recipient,
            metadata: {
              protocol: 1n,
              pointer: ipfsResult.value,
            },
          });
          break;
        }

        case RoundCategory.Direct: {
          const strategyInstance = new DirectGrantsLiteStrategy({
            chain: this.chainId,
            poolId: BigInt(args.roundId),
          });

          registerRecipientTx = strategyInstance.getRegisterRecipientData({
            registryAnchor: args.projectId,
            recipientAddress: metadata.application.recipient,
            metadata: {
              protocol: 1n,
              pointer: ipfsResult.value,
            },
          });
          break;
        }

        default:
          throw new AlloError("Unsupported strategy");
      }

      const txResult = await sendRawTransaction(this.transactionSender, {
        to: registerRecipientTx.to,
        data: registerRecipientTx.data,
        value: BigInt(registerRecipientTx.value),
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      let receipt: TransactionReceipt;

      try {
        receipt = await this.transactionSender.wait(txResult.value);
        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to apply to round");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(null));

      return success(args.projectId);
    });
  }

  bulkUpdateApplicationStatus(args: {
    roundId: string;
    strategyAddress: Address;
    applicationsToUpdate: {
      index: number;
      status: ApplicationStatus;
    }[];
    currentApplications: {
      index: number;
      status: ApplicationStatus;
    }[];
    strategy?: RoundCategory;
  }): AlloOperation<
    Result<void>,
    {
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      let strategyInstance;

      switch (args.strategy) {
        case RoundCategory.QuadraticFunding: {
          strategyInstance = new DonationVotingMerkleDistributionStrategy({
            chain: this.chainId,
            poolId: BigInt(args.roundId),
            address: args.strategyAddress,
          });
          break;
        }

        case RoundCategory.Direct: {
          strategyInstance = new DirectGrantsLiteStrategy({
            chain: this.chainId,
            poolId: BigInt(args.roundId),
            address: args.strategyAddress,
          });
          break;
        }

        default:
          return error(new AlloError("Unsupported strategy"));
      }

      let totalApplications = 0n;
      try {
        totalApplications = await strategyInstance.recipientsCounter();
      } catch (error) {
        totalApplications = BigInt(args.currentApplications.length + 1);
      }

      const rows = buildUpdatedRowsOfApplicationStatuses({
        applicationsToUpdate: args.applicationsToUpdate,
        currentApplications: args.currentApplications,
        statusToNumber: applicationStatusToNumber,
        bitsPerStatus: 4,
      });

      const txResult = await sendTransaction(this.transactionSender, {
        address: args.strategyAddress,
        abi: DonationVotingMerkleDistributionDirectTransferStrategyAbi as Abi,
        functionName: "reviewRecipients",
        args: [rows, totalApplications],
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      let receipt: TransactionReceipt;
      try {
        receipt = await this.transactionSender.wait(txResult.value);
        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to update application status");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(undefined));

      return success(undefined);
    });
  }

  fundRound(args: {
    tokenAddress: Address;
    roundId: string;
    amount: bigint;
  }): AlloOperation<
    Result<null>,
    {
      tokenApprovalStatus: Result<TransactionReceipt | null>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      if (isNaN(Number(args.roundId))) {
        return error(new AlloError("Round ID is not a valid Allo V2 pool ID"));
      }

      const poolId = BigInt(args.roundId);

      if (args.tokenAddress === zeroAddress) {
        emit("tokenApprovalStatus", success(null));
      } else {
        const approvalTx = await sendTransaction(this.transactionSender, {
          address: args.tokenAddress,
          abi: Erc20ABI,
          functionName: "approve",
          args: [this.allo.address(), args.amount],
        });

        if (approvalTx.type === "error") {
          return approvalTx;
        }

        try {
          const receipt = await this.transactionSender.wait(approvalTx.value);
          emit("tokenApprovalStatus", success(receipt));
        } catch (err) {
          const result = new AlloError("Failed to approve token transfer", err);
          emit("tokenApprovalStatus", error(result));
          return error(result);
        }
      }

      const tx = await sendTransaction(this.transactionSender, {
        address: this.allo.address(),
        abi: AlloAbi,
        functionName: "fundPool",
        args: [poolId, args.amount],
        value: args.tokenAddress === zeroAddress ? args.amount : 0n,
      });

      emit("transaction", tx);

      if (tx.type === "error") {
        return tx;
      }

      let receipt: TransactionReceipt;

      try {
        receipt = await this.transactionSender.wait(tx.value);
        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to fund round", err);
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(null));

      return success(null);
    });
  }

  withdrawFundsFromStrategy(args: {
    payoutStrategyAddress: Address;
    tokenAddress: Address;
    recipientAddress: Address;
  }): AlloOperation<
    Result<null>,
    {
      tokenApprovalStatus: Result<TransactionReceipt | null>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  > {
    let token = args.tokenAddress;
    if (token === zeroAddress) {
      token = getAddress(NATIVE);
    }

    return new AlloOperation(async ({ emit }) => {
      const tx = await sendTransaction(this.transactionSender, {
        address: args.payoutStrategyAddress,
        abi: DonationVotingMerkleDistributionDirectTransferStrategyAbi,
        functionName: "withdraw",
        args: [token],
      });

      emit("transaction", tx);

      if (tx.type === "error") {
        return tx;
      }

      let receipt: TransactionReceipt;

      try {
        receipt = await this.transactionSender.wait(tx.value);
        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to withdraw from strategy");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(null));

      return success(null);
    });
  }

  finalizeRound(args: {
    roundId: string;
    strategyAddress: Address;
    matchingDistribution: DistributionMatch[];
  }): AlloOperation<
    Result<null>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      const ipfsResult = await this.ipfsUploader({
        matchingDistribution: args.matchingDistribution,
      });

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      const distribution = args.matchingDistribution.map((d, index) => [
        index,
        d.anchorAddress,
        d.projectPayoutAddress,
        d.matchAmountInToken,
      ]);

      const tree = StandardMerkleTree.of(distribution, [
        "uint256",
        "address",
        "address",
        "uint256",
      ]);

      const merkleRoot = tree.root as Hex;

      {
        const txResult = await sendTransaction(this.transactionSender, {
          address: args.strategyAddress,
          abi: DonationVotingMerkleDistributionDirectTransferStrategyAbi,
          functionName: "updateDistribution",
          args: [merkleRoot, { protocol: 1n, pointer: ipfsResult.value }],
        });

        emit("transaction", txResult);

        if (txResult.type === "error") {
          return txResult;
        }

        let receipt: TransactionReceipt;
        try {
          receipt = await this.transactionSender.wait(txResult.value);
          emit("transactionStatus", success(receipt));
        } catch (err) {
          const result = new AlloError("Failed to update application status");
          emit("transactionStatus", error(result));
          return error(result);
        }

        await this.waitUntilIndexerSynced({
          chainId: this.chainId,
          blockNumber: receipt.blockNumber,
        });

        emit("indexingStatus", success(null));
      }

      return success(null);
    });
  }

  editRound(args: {
    roundId: Hex | number;
    roundAddress?: Hex;
    data: UpdateRoundParams;
    strategy?: RoundCategory;
  }): AlloOperation<
    Result<Hex | number>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      let receipt: TransactionReceipt | null = null;

      const data = args.data;

      if (typeof args.roundId != "number") {
        return error(new AlloError("roundId must be number"));
      }

      if (!args.roundAddress) {
        return error(new AlloError("roundAddress must be provided"));
      }

      /** Upload roundMetadata ( includes applicationMetadata ) to IPFS */
      if (data.roundMetadata && data.applicationMetadata) {
        const ipfsResult = await this.ipfsUploader({
          round: data.roundMetadata,
          application: data.applicationMetadata,
        });

        emit("ipfs", ipfsResult);

        if (ipfsResult.type === "error") {
          return ipfsResult;
        }

        /** Note: the pool metadata always calls `this.allo.updatePoolMetadata` and not the strategy */
        const txUpdateMetadata = this.allo.updatePoolMetadata({
          poolId: BigInt(args.roundId),
          metadata: {
            protocol: 1n,
            pointer: ipfsResult.value,
          },
        });

        const txResult = await sendRawTransaction(this.transactionSender, {
          to: txUpdateMetadata.to,
          data: txUpdateMetadata.data,
          value: BigInt(txUpdateMetadata.value),
        });

        if (txResult.type === "error") {
          return error(txResult.error);
        }

        try {
          // wait for 1st transaction to be mined
          receipt = await this.transactionSender.wait(txResult.value);
        } catch (err) {
          const result = new AlloError("Failed to update metadata");
          emit("transactionStatus", error(result));
          return error(result);
        }
      }

      let updateTimestampTxn: TransactionData | null = null;

      /** Note: timestamps updates happen by calling the strategy contract directly `this.strategy.updatePoolTimestamps` */
      switch (args.strategy) {
        case RoundCategory.QuadraticFunding: {
          const strategyInstance = new DonationVotingMerkleDistributionStrategy(
            {
              chain: this.chainId,
              poolId: BigInt(args.roundId),
              address: args.roundAddress,
            }
          );

          if (
            data.roundStartTime &&
            data.roundEndTime &&
            data.applicationsStartTime &&
            data.applicationsEndTime
          ) {
            updateTimestampTxn = strategyInstance.updatePoolTimestamps(
              dateToEthereumTimestamp(data.applicationsStartTime),
              dateToEthereumTimestamp(data.applicationsEndTime),
              dateToEthereumTimestamp(data.roundStartTime),
              dateToEthereumTimestamp(data.roundEndTime)
            );
          }

          break;
        }
        case RoundCategory.Direct: {
          // NOTE: TEST AFTER CREATION WORKS ON UI

          const strategyInstance = new DirectGrantsLiteStrategy({
            chain: this.chainId,
            poolId: BigInt(args.roundId),
            address: args.roundAddress,
          });

          if (data.applicationsStartTime && data.applicationsEndTime) {
            updateTimestampTxn = strategyInstance.updatePoolTimestamps(
              dateToEthereumTimestamp(data.applicationsStartTime),
              dateToEthereumTimestamp(data.applicationsEndTime)
            );
          }

          break;
        }

        default:
          throw new AlloError("Unsupported strategy");
      }

      if (updateTimestampTxn) {
        const timestampTxResult = await sendRawTransaction(
          this.transactionSender,
          {
            to: updateTimestampTxn.to,
            data: updateTimestampTxn.data,
            value: BigInt(updateTimestampTxn.value),
          }
        );

        if (timestampTxResult.type === "error") {
          return error(timestampTxResult.error);
        }

        try {
          // wait for 2nd transaction to be mined
          receipt = await this.transactionSender.wait(timestampTxResult.value);
        } catch (err) {
          const result = new AlloError("Failed to update timestamps");
          emit("transactionStatus", error(result));
          return error(result);
        }
      }

      if (!receipt) return error(new AlloError("No receipt found"));

      // note: we have 2 txns, allo.updatePoolMetadata and strategy.timestamp
      // handle the case where only 1 happens or both
      emit("transactionStatus", success(receipt));

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(void 0));

      return success(args.roundId);
    });
  }

  batchDistributeFunds(args: {
    payoutStrategyOrPoolId: string;
    allProjects: MatchingStatsData[];
    projectIdsToBePaid: string[];
  }): AlloOperation<
    Result<null>,
    {
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      const poolId = BigInt(args.payoutStrategyOrPoolId);
      const recipientIds: Address[] = args.projectIdsToBePaid.map((id) =>
        getAddress(id)
      );

      // Generate merkle tree
      const { tree, matchingResults } = generateMerkleTreeV2(args.allProjects);

      // Filter projects to be paid from matching results
      const projectsToBePaid = matchingResults.filter((project) =>
        args.projectIdsToBePaid.includes(project.anchorAddress ?? "")
      );

      const projectsWithMerkleProof: Distribution[] = [];

      projectsToBePaid.forEach((project) => {
        if (!project.index) {
          if (project.index === 0) {
            // do nothing
          } else {
            throw new AlloError("Project index is required");
          }
        }
        if (!project.anchorAddress) {
          throw new AlloError("Anchor address is required");
        }
        const distribution: [number, string, string, BigNumber] = [
          project.index,
          project.anchorAddress,
          project.projectPayoutAddress,
          project.matchAmountInToken,
        ];

        // Generate merkle proof
        const validMerkleProof = tree.getProof(distribution);

        projectsWithMerkleProof.push({
          index: BigInt(distribution[0]),
          recipientId: distribution[1] as Address,
          amount: BigInt(distribution[3].toString()),
          merkleProof: validMerkleProof as Address[],
        });
      });

      const strategy = new DonationVotingMerkleDistributionStrategy({
        chain: this.chainId,
        poolId: poolId,
      });

      const txData = strategy.distribute(
        recipientIds,
        projectsWithMerkleProof,
      );

      const txResult = await sendRawTransaction(this.transactionSender, {
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value),
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      let receipt: TransactionReceipt;
      try {
        receipt = await this.transactionSender.wait(txResult.value);
        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to distribute funds");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(null));

      return success(null);
    });
  }

  payoutDirectGrants(args: {
    roundId: Hex | number;
    token: Hex;
    amount: bigint;
    recipientAddress: Hex;
    recipientId: Hex;
    vault?: Hex;
    applicationIndex?: number;
  }): AlloOperation<
    Result<{ blockNumber: bigint }>,
    {
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      const strategy = new DirectGrantsLiteStrategy({
        chain: this.chainId,
        poolId: BigInt(args.roundId),
      });

      const txData = strategy.getAllocateData([
        {
          token: args.token,
          recipientId: args.recipientId,
          amount: BigInt(args.amount.toString()),
        },
      ]);

      const tx = await sendRawTransaction(this.transactionSender, {
        to: txData.to,
        data: txData.data,
        value: BigInt(txData.value),
      });

      emit("transaction", tx);

      if (tx.type === "error") {
        return tx;
      }

      let receipt: TransactionReceipt;

      try {
        receipt = await this.transactionSender.wait(tx.value);
        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to payout direct grants");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(void 0));

      return success({
        blockNumber: receipt.blockNumber,
      });
    });
  }
}

export function serializeProject(project: ProjectWithMerkleProof) {
  return utils.defaultAbiCoder.encode(
    ["uint256", "address", "uint256", "bytes32[]"],
    [
      project.index,
      project.recipientId,
      project.amount,
      project.merkleProof.map(utils.formatBytes32String),
    ]
  );
}

export function serializeProjects(projects: ProjectWithMerkleProof[]): Hex {
  const serializedProjects = projects.map(serializeProject);
  return utils.defaultAbiCoder.encode(["bytes[]"], [serializedProjects]) as Hex;
}

export type ProjectWithMerkleProof = {
  index: number;
  recipientId: string;
  amount: BigNumber;
  merkleProof: string[];
};

/**
 * Generate merkle tree
 *
 * To get merkle Proof: tree.getProof(distributions[0]);
 * @param matchingResults MatchingStatsData[]
 * @returns
 */
export const generateMerkleTreeV2 = (
  matchingResults: MatchingStatsData[]
): {
  distribution: [number, string, string, BigNumber][];
  tree: StandardMerkleTree<[number, string, string, BigNumber]>;
  matchingResults: MatchingStatsData[];
} => {
  const distribution: [number, string, string, BigNumber][] = [];

  matchingResults.forEach((matchingResult, index) => {
    matchingResults[index].index = index;

    distribution.push([
      index,
      matchingResult.anchorAddress ?? "",
      matchingResult.projectPayoutAddress,
      matchingResult.matchAmountInToken, // TODO: FIX
    ]);
  });

  const tree = StandardMerkleTree.of(distribution, [
    "uint256",
    "address",
    "address",
    "uint256",
  ]);

  return { distribution, tree, matchingResults };
};
