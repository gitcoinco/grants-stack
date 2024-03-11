import {
  AlloAbi,
  Allo as AlloV2Contract,
  CreateProfileArgs,
  DirectGrantsStrategy,
  DirectGrantsStrategyTypes,
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
import { UpdateRoundParams, VotingToken } from "../../types";
import { Allo, AlloError, AlloOperation, CreateRoundArguments } from "../allo";
import { Result, dateToEthereumTimestamp, error, success } from "../common";
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

const STRATEGY_ADDRESSES = {
  [RoundCategory.QuadraticFunding]:
    "0x25551cbfc377501ef0be053ce61ff7ecef411f51",
  [RoundCategory.Direct]: "0x726d2398E79c9535Dd81FB1576A8aCB798c35951",
};

function applicationStatusToNumber(status: ApplicationStatus) {
  switch (status) {
    case "PENDING":
    case "IN_REVIEW":
      return 1n;
    case "APPROVED":
      return 2n;
    case "REJECTED":
      return 3n;
    default:
      throw new Error(`Unknown status ${status}`);
  }
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
    allo: Address;
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
    token: VotingToken,
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
      throw new Error(
        "Tried voting using erc-20 but no permit signature provided"
      );
    }

    if (tx.type === "success") {
      return this.transactionSender.wait(tx.value, 60_000, publicClient);
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
        const initStrategyData: DirectGrantsStrategyTypes.InitializeParams = {
          registryGating: true,
          metadataRequired: true,
          grantAmountRequired: true,
          registrationStartTime: dateToEthereumTimestamp(
            args.roundData.roundStartTime
          ), // in seconds, must be in future
          registrationEndTime: dateToEthereumTimestamp(
            args.roundData.roundEndTime
          ), // in seconds, must be after registrationStartTime
        };

        const strategy = new DirectGrantsStrategy({
          chain: this.chainId,
        });

        initStrategyDataEncoded = strategy.getInitializeData(initStrategyData);
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
        strategy: STRATEGY_ADDRESSES[args.roundData.roundCategory],
        initStrategyData: initStrategyDataEncoded,
        token,
        amount: 0n, // we send 0 tokens to the pool, we fund it later
        metadata: { protocol: 1n, pointer: roundIpfsResult.value },
        managers: args.roundData.roundOperators ?? [],
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
          const strategyInstance = new DirectGrantsStrategy({
            chain: this.chainId,
            poolId: BigInt(args.roundId),
          });

          const answers = metadata.application.answers;
          const amountAnswer = answers.find(
            (a) => a.question === "Amount requested"
          );

          registerRecipientTx = strategyInstance.getRegisterRecipientData({
            registryAnchor: args.projectId,
            recipientAddress: metadata.application.recipient,
            grantAmount: BigInt((amountAnswer?.answer as string) ?? 0),
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
        await this.waitUntilIndexerSynced({
          chainId: this.chainId,
          blockNumber: receipt.blockNumber,
        });

        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to apply to round");
        emit("transactionStatus", error(result));
        return error(result);
      }

      return success(receipt.transactionHash);
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
  }): AlloOperation<
    Result<void>,
    {
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      if (args.applicationsToUpdate.some((app) => app.status === "IN_REVIEW")) {
        throw new AlloError("DirectGrants is not supported yet!");
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
        args: [rows, args.currentApplications.length + 1],
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
        d.applicationId,
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

          const strategyInstance = new DirectGrantsStrategy({
            chain: this.chainId,
            poolId: BigInt(args.roundId),
            address: args.roundAddress,
          });

          if (data.applicationsStartTime && data.applicationsEndTime) {
            updateTimestampTxn = strategyInstance.getUpdatePoolTimestampsData(
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
}
