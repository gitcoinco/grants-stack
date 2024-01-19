import { Address, Hex } from "viem";
import { Allo, AlloError, AlloOperation } from "../allo";
import {
  TransactionReceipt,
  TransactionSender,
  decodeEventFromReceipt,
  sendTransaction,
} from "../transaction-sender";
import { Result, error, success } from "../common";
import ProjectRegistryABI from "../abis/allo-v1/ProjectRegistry";
import RoundFactoryABI from "../abis/allo-v1/RoundFactory";
import { IpfsUploader } from "../ipfs";
import { WaitUntilIndexerSynced } from "../indexer";
import { keccak256, encodePacked } from "viem";
import { AnyJson } from "../..";
import { CreateRoundData, RoundCategory } from "../../types";

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
  private chainId: number;

  constructor(args: {
    chainId: number;
    transactionSender: TransactionSender;
    projectRegistryAddress: Address;
    roundFactoryAddress: Address;
    ipfsUploader: IpfsUploader;
    waitUntilIndexerSynced: WaitUntilIndexerSynced;
  }) {
    this.chainId = args.chainId;
    this.transactionSender = args.transactionSender;
    this.projectRegistryAddress = args.projectRegistryAddress;
    this.roundFactoryAddress = args.roundFactoryAddress;
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
  createRound(args: { rounddata: CreateRoundData }): AlloOperation<
    Result<{ roundId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      const QF =
        args.rounddata?.roundCategory === RoundCategory.QuadraticFunding;

      // --- upload metadata to IPFS
      const ipfsResult = await this.ipfsUploader(
        args.rounddata.roundMetadataWithProgramContractAddress
      );

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      // --- send transaction to create round
      const txResult = await sendTransaction(this.transactionSender, {
        address: this.roundFactoryAddress,
        abi: RoundFactoryABI,
        functionName: "createRound",
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
