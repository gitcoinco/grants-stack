import {
  Address,
  encodeAbiParameters,
  encodePacked,
  getAddress,
  Hex,
  hexToBigInt,
  keccak256,
  maxUint256,
  parseAbiParameters,
  parseUnits,
  PublicClient,
  zeroAddress,
} from "viem";
import { AnyJson, ChainId } from "../..";
import { parseChainId } from "../../chains";
import { payoutTokens } from "../../payoutTokens";
import { RoundCategory, VotingToken } from "../../types";
import ProjectRegistryABI from "../abis/allo-v1/ProjectRegistry";
import RoundFactoryABI from "../abis/allo-v1/RoundFactory";
import RoundImplementationABI from "../abis/allo-v1/RoundImplementation";
import ProgramFactoryABI from "../abis/allo-v1/ProgramFactory";
import {
  dgVotingStrategyDummyContractMap,
  directPayoutStrategyFactoryContractMap,
  programFactoryMap,
  merklePayoutStrategyFactoryMap,
  projectRegistryMap,
  qfVotingStrategyFactoryMap,
  roundFactoryMap,
} from "../addresses/allo-v1";
import { Allo, AlloError, AlloOperation, CreateRoundArguments } from "../allo";
import { error, Result, success } from "../common";
import { WaitUntilIndexerSynced } from "../indexer";
import { IpfsUploader } from "../ipfs";
import {
  decodeEventFromReceipt,
  sendTransaction,
  TransactionReceipt,
  TransactionSender,
} from "../transaction-sender";
import { getPermitType, PermitSignature } from "../voting";
import MRC_ABI from "../abis/allo-v1/multiRoundCheckout";
import { MRC_CONTRACTS } from "../addresses/mrc";
import { ApplicationStatus } from "data-layer";
import { buildUpdatedRowsOfApplicationStatuses } from "../application";

function createProjectId(args: {
  chainId: number;
  registryAddress: Address;
  projectIndex: bigint;
}): Hex {
  return keccak256(
    encodePacked(
      ["uint256", "address", "uint256"],
      [BigInt(args.chainId), args.registryAddress, args.projectIndex]
    )
  );
}

function applicationStatusToNumber(status: ApplicationStatus) {
  switch (status) {
    case "PENDING":
      return 0n;
    case "APPROVED":
      return 1n;
    case "REJECTED":
      return 2n;
    default:
      throw new Error(`Unknown status ${status}`);
  }
}

export class AlloV1 implements Allo {
  private readonly projectRegistryAddress: Address;
  private readonly roundFactoryAddress: Address;
  private readonly transactionSender: TransactionSender;
  private readonly ipfsUploader: IpfsUploader;
  private readonly waitUntilIndexerSynced: WaitUntilIndexerSynced;
  private readonly chainId: ChainId;

  constructor(args: {
    chainId: number;
    transactionSender: TransactionSender;
    ipfsUploader: IpfsUploader;
    waitUntilIndexerSynced: WaitUntilIndexerSynced;
  }) {
    this.chainId = parseChainId(args.chainId);
    this.transactionSender = args.transactionSender;
    this.projectRegistryAddress = projectRegistryMap[this.chainId];
    this.roundFactoryAddress = roundFactoryMap[this.chainId];
    this.ipfsUploader = args.ipfsUploader;
    this.waitUntilIndexerSynced = args.waitUntilIndexerSynced;
  }

  async voteUsingMRCContract(
    publicClient: PublicClient,
    chainId: ChainId,
    token: VotingToken,
    groupedVotes: Record<string, Hex[]>,
    groupedAmounts: Record<string, bigint>,
    nativeTokenAmount: bigint,
    permit?: {
      sig: PermitSignature;
      deadline: number;
      nonce: bigint;
    }
  ) {
    let tx: Result<Hex>;
    const mrcAddress = MRC_CONTRACTS[chainId];

    /* decide which function to use based on whether token is native, permit-compatible or DAI */
    if (token.address === zeroAddress) {
      tx = await sendTransaction(this.transactionSender, {
        address: mrcAddress,
        abi: MRC_ABI,
        functionName: "vote",
        args: [
          Object.values(groupedVotes),
          Object.keys(groupedVotes) as Hex[],
          Object.values(groupedAmounts),
        ],
        value: nativeTokenAmount,
      });
    } else if (permit) {
      if (getPermitType(token) === "dai") {
        tx = await sendTransaction(this.transactionSender, {
          address: mrcAddress,
          abi: MRC_ABI,
          functionName: "voteDAIPermit",
          args: [
            Object.values(groupedVotes),
            Object.keys(groupedVotes) as Hex[],
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
          functionName: "voteERC20Permit",
          args: [
            Object.values(groupedVotes),
            Object.keys(groupedVotes) as Hex[],
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

  createProject(args: { name: string; metadata: AnyJson }): AlloOperation<
    Result<{ projectId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      // --- upload metadata to IPFS
      const ipfsResult = await this.ipfsUploader(args.metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      // --- send transaction to create project
      const txResult = await sendTransaction(this.transactionSender, {
        address: this.projectRegistryAddress,
        abi: ProjectRegistryABI,
        functionName: "createProject",
        args: [{ protocol: BigInt(1), pointer: ipfsResult.value }],
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      // --- wait for transaction to be mined
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
        abi: ProjectRegistryABI,
        receipt,
        event: "ProjectCreated",
      });

      const projectId = createProjectId({
        chainId: this.chainId,
        registryAddress: this.projectRegistryAddress,
        projectIndex: projectCreatedEvent.projectID,
      });

      return success({
        projectId,
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
    return new AlloOperation(async ({ emit }) => {
      const metadata = {
        type: "program",
        name: args.name,
      };

      const ipfsResult = await this.ipfsUploader(metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      const programFactoryAddress = programFactoryMap[this.chainId];

      const abiType = parseAbiParameters([
        "(uint256 protocol, string pointer), address[], address[]",
      ]);

      if (args.memberAddresses.length === 0) {
        return error(new AlloError("You must atleast specify one operator"));
      }

      const ownerAddress = args.memberAddresses[0];

      const encodedInitParameters = encodeAbiParameters(abiType, [
        { protocol: 1n, pointer: ipfsResult.value },
        [ownerAddress],
        args.memberAddresses.slice(1),
      ]);

      const txResult = await sendTransaction(this.transactionSender, {
        address: programFactoryAddress,
        abi: ProgramFactoryABI,
        functionName: "create",
        args: [encodedInitParameters],
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
        const result = new AlloError("Failed to create program", err);
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(void 0));

      const programCreatedEvent = decodeEventFromReceipt({
        abi: ProgramFactoryABI,
        receipt,
        event: "ProgramCreated",
      });

      return success({
        programId: programCreatedEvent.programContractAddress,
      });
    });
  }

  // projectId is the grantId and not the fullProjectId as computed by createProjectId
  updateProjectMetadata(args: {
    projectId: Hex; // Note: this is projectIndex
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
      // --- upload metadata to IPFS
      const ipfsResult = await this.ipfsUploader(args.metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      const projectIndex = hexToBigInt(args.projectId);

      // --- send transaction to update project metadata
      const txResult = await sendTransaction(this.transactionSender, {
        address: this.projectRegistryAddress,
        abi: ProjectRegistryABI,
        functionName: "updateProjectMetadata",
        args: [
          projectIndex,
          { protocol: BigInt(1), pointer: ipfsResult.value },
        ],
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      // --- wait for transaction to be mined
      let receipt: TransactionReceipt;

      try {
        receipt = await this.transactionSender.wait(txResult.value);

        await this.waitUntilIndexerSynced({
          chainId: this.chainId,
          blockNumber: receipt.blockNumber,
        });

        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to update project metadata");
        emit("transactionStatus", error(result));
        return error(result);
      }

      return success({
        projectId: args.projectId,
      });
    });
  }

  /** Creates a round on Allo v1*/
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
      try {
        const isQF =
          args.roundData?.roundCategory === RoundCategory.QuadraticFunding;

        const votingStrategyFactory = isQF
          ? qfVotingStrategyFactoryMap[this.chainId]
          : dgVotingStrategyDummyContractMap[this.chainId];
        const payoutStrategyFactory = isQF
          ? merklePayoutStrategyFactoryMap[this.chainId]
          : directPayoutStrategyFactoryContractMap[this.chainId];

        // --- upload metadata to IPFS
        const [roundIpfsResult, applicationMetadataIpfsResult] =
          await Promise.all([
            this.ipfsUploader(
              args.roundData.roundMetadataWithProgramContractAddress
            ),
            this.ipfsUploader(args.roundData.applicationQuestions),
          ]);

        emit(
          "ipfsStatus",
          [roundIpfsResult, applicationMetadataIpfsResult].every(
            (status) => status.type === "success"
          )
            ? success("")
            : error(new Error("ipfs error"))
        );

        if (roundIpfsResult.type === "error") {
          return roundIpfsResult;
        }

        if (applicationMetadataIpfsResult.type === "error") {
          return applicationMetadataIpfsResult;
        }

        let initRoundTimes: bigint[];
        const admins: Address[] = [
          getAddress(await args.walletSigner.getAddress()),
        ];
        if (isQF) {
          if (args.roundData.applicationsEndTime === undefined) {
            args.roundData.applicationsEndTime = args.roundData.roundStartTime;
          }

          initRoundTimes = [
            dateToEthereumTimestamp(args.roundData.applicationsStartTime),
            dateToEthereumTimestamp(args.roundData.applicationsEndTime),
            dateToEthereumTimestamp(args.roundData.roundStartTime),
            dateToEthereumTimestamp(args.roundData.roundEndTime),
          ];
        } else {
          // note: DirectRounds does not set application dates.
          // in those cases, we set:
          // application start time with the round start time
          // application end time with MaxUint256.
          // if the round has not end time, we set it with MaxUint256.

          initRoundTimes = [
            dateToEthereumTimestamp(
              args.roundData.applicationsStartTime ??
                args.roundData.roundStartTime
            ),
            args.roundData.applicationsEndTime
              ? dateToEthereumTimestamp(args.roundData.applicationsEndTime)
              : args.roundData.roundEndTime
              ? dateToEthereumTimestamp(args.roundData.roundEndTime)
              : maxUint256,
            dateToEthereumTimestamp(args.roundData.roundStartTime),
            args.roundData.roundEndTime
              ? dateToEthereumTimestamp(args.roundData.roundEndTime)
              : maxUint256,
          ];
        }

        let parsedTokenAmount = 0n;

        if (isQF) {
          // Ensure tokenAmount is normalized to token decimals
          const tokenAmount = args.roundData.matchingFundsAvailable ?? 0;
          const pyToken = payoutTokens.filter(
            (t) =>
              t.address.toLowerCase() === args.roundData.token.toLowerCase()
          )[0];
          parsedTokenAmount = parseUnits(
            tokenAmount.toString(),
            pyToken.decimal
          );
        }

        const createRoundArguments = constructCreateRoundArgs({
          initTimes: initRoundTimes,
          matchingAmount: parsedTokenAmount,
          roundOperators: args.roundData.roundOperators ?? [],
          roundAdmins: admins ?? [],
          roundToken: getAddress(args.roundData.token ?? zeroAddress),
          payoutStrategyFactory,
          votingStrategyFactory,
          roundMetadata: {
            protocol: BigInt(1),
            pointer: roundIpfsResult.value,
          },
          applicationMetadata: {
            protocol: BigInt(1),
            pointer: applicationMetadataIpfsResult.value,
          },
        });

        // --- send transaction to create round
        const txResult = await sendTransaction(this.transactionSender, {
          address: this.roundFactoryAddress,
          abi: RoundFactoryABI,
          functionName: "create",
          args: [
            createRoundArguments,
            args.roundData.roundMetadataWithProgramContractAddress
              ?.programContractAddress as Address,
          ],
        });

        emit("transaction", txResult);

        if (txResult.type === "error") {
          return txResult;
        }

        // --- wait for transaction to be mined
        let receipt: TransactionReceipt;

        try {
          receipt = await this.transactionSender.wait(txResult.value);

          emit("transactionStatus", success(receipt));
        } catch (err) {
          const result = new AlloError("Failed to create round");
          emit("transactionStatus", error(result));
          return error(result);
        }

        await this.waitUntilIndexerSynced({
          chainId: this.chainId,
          blockNumber: receipt.blockNumber,
        });

        emit("indexingStatus", success(void 0));

        const roundCreatedEvent = decodeEventFromReceipt({
          abi: RoundFactoryABI,
          receipt,
          event: "RoundCreated",
        });

        return success({
          roundId: roundCreatedEvent.roundAddress,
        });
      } catch (e) {
        alert(e);
        return error(e as Error);
      }
    });
  }

  /**
   * Applies to a round for Allo v1
   *
   * @param args { projectId: Hex; roundId: Hex; metadata: AnyJson }
   *
   * @public
   *
   * @returns AllotOperation<Result<Hex>, { ipfs: Result<string>; transaction: Result<Hex>; transactionStatus: Result<TransactionReceipt> }>
   */
  applyToRound(args: {
    projectId: Hex;
    roundId: Hex | number;
    metadata: AnyJson;
  }): AlloOperation<
    Result<Hex>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      if (typeof args.roundId == "number") {
        return error(new AlloError("roundId must be Hex"));
      }

      const ipfsResult = await this.ipfsUploader(args.metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      const txResult = await sendTransaction(this.transactionSender, {
        address: args.roundId,
        abi: RoundImplementationABI,
        functionName: "applyToRound",
        args: [args.projectId, { protocol: 1n, pointer: ipfsResult.value }],
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

      const roundAddress = getAddress(args.roundId);
      const rows = buildUpdatedRowsOfApplicationStatuses({
        applicationsToUpdate: args.applicationsToUpdate,
        currentApplications: args.currentApplications,
        statusToNumber: applicationStatusToNumber,
        bitsPerStatus: 2,
      });

      const txResult = await sendTransaction(this.transactionSender, {
        address: roundAddress,
        abi: RoundImplementationABI,
        functionName: "setApplicationStatuses",
        args: [rows],
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
}

export type CreateRoundArgs = {
  roundMetadata: { protocol: bigint; pointer: string };
  applicationMetadata: { protocol: bigint; pointer: string };
  votingStrategyFactory: `0x${string}`;
  payoutStrategyFactory: `0x${string}`;
  roundOperators: Address[];
  roundAdmins: Address[];
  roundToken: Address;
  initTimes: bigint[];
  matchingAmount: bigint;
};

function constructCreateRoundArgs({
  initTimes,
  matchingAmount,
  roundAdmins,
  roundOperators,
  votingStrategyFactory,
  payoutStrategyFactory,
  roundToken,
  roundMetadata,
  applicationMetadata,
}: CreateRoundArgs) {
  const abiType = parseAbiParameters([
    "(address votingStrategy, address payoutStrategy),(uint256 applicationsStartTime, uint256 applicationsEndTime, uint256 roundStartTime, uint256 roundEndTime),uint256,address,uint8,address,((uint256 protocol, string pointer), (uint256 protocol, string pointer)),(address[] adminRoles, address[] roundOperators)",
  ]);
  return encodeAbiParameters(abiType, [
    {
      votingStrategy: votingStrategyFactory,
      payoutStrategy: payoutStrategyFactory,
    },
    {
      applicationsStartTime: initTimes[0],
      applicationsEndTime: initTimes[1],
      roundStartTime: initTimes[2],
      roundEndTime: initTimes[3],
    },
    matchingAmount,
    getAddress(roundToken ?? zeroAddress),
    0,
    zeroAddress,
    [roundMetadata, applicationMetadata],
    {
      roundOperators,
      adminRoles: roundAdmins,
    },
  ]);
}

const dateToEthereumTimestamp = (date: Date) =>
  BigInt(Math.floor(date.getTime() / 1000));
