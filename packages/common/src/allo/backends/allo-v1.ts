import {
  Address,
  encodeAbiParameters,
  encodePacked,
  getAddress,
  Hex,
  keccak256,
  maxUint256,
  parseAbiParameters,
  parseUnits,
  zeroAddress,
} from "viem";
import { Allo, AlloError, AlloOperation } from "../allo";
import {
  decodeEventFromReceipt,
  sendTransaction,
  TransactionReceipt,
  TransactionSender,
} from "../transaction-sender";
import { error, Result, success } from "../common";
import ProjectRegistryABI from "../abis/allo-v1/ProjectRegistry";
import RoundFactoryABI from "../abis/allo-v1/RoundFactory";
import { IpfsUploader } from "../ipfs";
import { WaitUntilIndexerSynced } from "../indexer";
import { AnyJson, ChainId, useWallet } from "../..";
import { CreateRoundData, RoundCategory } from "../../types";
import { parseChainId } from "../../chains";
import {
  dgVotingStrategyDummyContractMap,
  directPayoutStrategyFactoryContractMap,
  merklePayoutStrategyFactoryMap,
  projectRegistryMap,
  qfVotingStrategyFactoryMap,
  roundFactoryMap,
} from "../addresses/allo-v1";
import { Round } from "data-layer";
import { payoutTokens } from "../../payoutTokens";

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
        args: [{ protocol: 1n, pointer: ipfsResult.value }],
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

      // --- send transaction to update project metadata
      const txResult = await sendTransaction(this.transactionSender, {
        address: args.projectId,
        abi: ProjectRegistryABI,
        functionName: "updateProjectMetadata",
        args: [args.projectId, { protocol: 1n, pointer: ipfsResult.value }],
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
        const result = new AlloError("Failed to update project metadata");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      return success({
        projectId: args.projectId,
      });
    });
  }

  /** Creates a round on Allo v1*/
  createRound(args: { roundData: CreateRoundData }): AlloOperation<
    Result<{ roundId: Hex }>,
    {
      ipfsStatus: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
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

      const { signer: walletSigner } = useWallet();

      let initRoundTimes: bigint[] = [];
      let operators: Address[] | undefined = [];
      let admins: Address[] | undefined = [];

      if (isQF) {
        if (args.roundData.round.applicationsEndTime === undefined) {
          args.roundData.round.applicationsEndTime =
            args.roundData.round.roundStartTime;
        }

        args.roundData.round.operatorWallets =
          args.roundData.round.operatorWallets?.filter((e) => e !== "");

        operators = args.roundData.round.operatorWallets?.map((e) =>
          getAddress(e)
        );

        admins = [getAddress((await walletSigner?.getAddress()) ?? "")];

        initRoundTimes = [
          dateToBigInt(args.roundData.round.applicationsStartTime),
          dateToBigInt(args.roundData.round.applicationsEndTime),
          dateToBigInt(args.roundData.round.roundStartTime),
          dateToBigInt(args.roundData.round.roundEndTime),
        ];
      } else {
        // note: DirectRounds does not set application dates.
        // in those cases, we set:
        // application start time with the round start time
        // application end time with MaxUint256.
        // if the round has not end time, we set it with MaxUint256.

        initRoundTimes = [
          dateToBigInt(
            args.roundData.round.applicationsStartTime ??
              args.roundData.round.roundStartTime
          ),
          args.roundData.round.applicationsEndTime
            ? dateToBigInt(args.roundData.round.applicationsEndTime)
            : dateToBigInt(args.roundData.round.roundEndTime)
            ? dateToBigInt(args.roundData.round.roundEndTime)
            : maxUint256,
          dateToBigInt(args.roundData.round.roundStartTime),
          args.roundData.round.roundEndTime
            ? dateToBigInt(args.roundData.round.roundEndTime)
            : maxUint256,
        ];
      }

      let parsedTokenAmount = 0n;

      if (isQF) {
        // Ensure tokenAmount is normalized to token decimals
        const tokenAmount =
          args.roundData.round.roundMetadata?.quadraticFundingConfig
            ?.matchingFundsAvailable ?? 0;
        const pyToken = payoutTokens.filter(
          (t) =>
            t.address.toLowerCase() === args.roundData.round.token.toLowerCase()
        )[0];
        parsedTokenAmount = parseUnits(tokenAmount.toString(), pyToken.decimal);
      }

      const roundContractInputsWithPointers = {
        ...args.roundData,
        store: {
          protocol: 1n,
          pointer: roundIpfsResult.value,
        },
        applicationStore: {
          protocol: 1n,
          pointer: applicationMetadataIpfsResult.value,
        },
        votingStrategyFactory,
        payoutStrategyFactory,
      };

      // --- send transaction to create round
      const txResult = await sendTransaction(this.transactionSender, {
        address: this.roundFactoryAddress,
        abi: RoundFactoryABI,
        functionName: "createRound",
        args: [
          constructCreateRoundArgs({
            round: roundContractInputsWithPointers,
            initTimes: initRoundTimes,
            matchingAmount: parsedTokenAmount,
            operators: operators ?? [],
            admins: admins ?? [],
          }),
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
    });
  }
}
type ConstructCreateRoundArgs = {
  store: { protocol: bigint; pointer: string };
  applicationStore: { protocol: bigint; pointer: string };
  votingStrategyFactory: `0x${string}`;
  payoutStrategyFactory: `0x${string}`;
  roundMetadataWithProgramContractAddress?: {};
  applicationQuestions: {};
  round: Round;
  roundCategory: RoundCategory;
};

function constructCreateRoundArgs({
  round,
  initTimes,
  matchingAmount,
  operators,
  admins,
}: {
  round: ConstructCreateRoundArgs;
  initTimes: bigint[];
  matchingAmount: bigint;
  operators: Address[];
  admins: Address[];
}) {
  let abiType = parseAbiParameters([
    "(address votingStrategy, address payoutStrategy),(uint256 applicationsStartTime, uint256 applicationsEndTime, uint256 roundStartTime, uint256 roundEndTime),uint256,address,uint8,address,((uint256 protocol, string pointer), (uint256 protocol, string pointer)),(address[] adminRoles, address[] roundOperators)",
  ]);
  return encodeAbiParameters(abiType, [
    {
      votingStrategy: round.votingStrategyFactory,
      payoutStrategy: round.payoutStrategyFactory,
    },
    {
      applicationsStartTime: initTimes[0],
      applicationsEndTime: initTimes[1],
      roundStartTime: initTimes[2],
      roundEndTime: initTimes[3],
    },
    matchingAmount,
    getAddress(round.round.token),
    0,
    zeroAddress,
    [round.store, round.applicationStore],
    {
      roundOperators: operators,
      adminRoles: admins,
    },
  ]);
}

const dateToBigInt = (date: Date) => BigInt(Math.floor(date.getTime() / 1000));
