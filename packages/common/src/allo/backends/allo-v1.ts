import {
  Address,
  encodeAbiParameters,
  encodePacked,
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
import { AnyJson, ChainId } from "../..";
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
  private projectRegistryAddress: Address;
  private roundFactoryAddress: Address;
  private transactionSender: TransactionSender;
  private ipfsUploader: IpfsUploader;
  private waitUntilIndexerSynced: WaitUntilIndexerSynced;
  private chainId: ChainId;

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

  // create round
  createRound(args: { roundData: CreateRoundData }): AlloOperation<
    Result<{ roundId: Hex }>,
    {
      applicationMetadataIpfs: Result<string>;
      roundMetadataIpfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
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
      const roundIpfsResult = await this.ipfsUploader(
        args.roundData.roundMetadataWithProgramContractAddress
      );

      const applicationMetadataIpfsResult = await this.ipfsUploader(
        args.roundData.applicationQuestions
      );

      emit("roundMetadataIpfs", roundIpfsResult);
      emit("applicationMetadataIpfs", applicationMetadataIpfsResult);

      if (roundIpfsResult.type === "error") {
        return roundIpfsResult;
      }

      if (applicationMetadataIpfsResult.type === "error") {
        return applicationMetadataIpfsResult;
      }

      let initRoundTimes: string[] = [];
      const formatDate = (date: Date) => (date.getTime() / 1000).toString();
      if (isQF) {
        if (args.roundData.round.applicationsEndTime === undefined) {
          args.roundData.round.applicationsEndTime =
            args.roundData.round.roundStartTime;
        }
        initRoundTimes = [
          formatDate(args.roundData.round.applicationsStartTime),
          formatDate(args.roundData.round.applicationsEndTime),
          formatDate(args.roundData.round.roundStartTime),
          formatDate(args.roundData.round.roundEndTime),
        ];
      } else {
        // note: DirectRounds does not set application dates.
        // in those cases, we set:
        // application start time with the round start time
        // application end time with MaxUint256.
        // if the round has not end time, we set it with MaxUint256.

        initRoundTimes = [
          formatDate(
            args.roundData.round.applicationsStartTime ??
              args.roundData.round.roundStartTime
          ),
          args.roundData.round.applicationsEndTime
            ? formatDate(args.roundData.round.applicationsEndTime)
            : args.roundData.round.roundEndTime
            ? formatDate(args.roundData.round.roundEndTime)
            : maxUint256.toString(),
          formatDate(args.roundData.round.roundStartTime),
          args.roundData.round.roundEndTime
            ? formatDate(args.roundData.round.roundEndTime)
            : maxUint256.toString(),
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
        args: constructCreateRoundArgs(roundContractInputsWithPointers),
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
  roundMetadataWithProgramContractAddress: {} | undefined;
  applicationQuestions: {};
  round: Round;
  roundCategory: RoundCategory;
};

function constructCreateRoundArgs(round: ConstructCreateRoundArgs) {
  let abiType = parseAbiParameters([
    "(address votingStrategy, address payoutStrategy)",
    "(uint256 applicationsStartTime, uint256 applicationsEndTime, uint256 roundStartTime, uint256 roundEndTime)",
    "uint256",
    "address",
    "uint8",
    "address",
    "((uint256 protocol, string pointer), (uint256 protocol, string pointer))",
    "(address[] adminRoles, address[] roundOperators)",
  ]);
  return encodeAbiParameters(abiType, [
    {
      votingStrategy: round.votingStrategyFactory,
      payoutStrategy: round.payoutStrategyFactory,
    },
  ]);
}
