import { Address, Hex } from "viem";
import { Allo, AlloError, AlloOperation } from "../allo";
import {
  TransactionReceipt,
  TransactionSender,
  decodeEventFromReceipt,
  sendRawTransaction,
} from "../transaction-sender";
import { Result, error, success } from "../common";
import RegistryABI from "../abis/allo-v2/Registry";
import { IpfsUploader } from "../ipfs";
import { WaitUntilIndexerSynced } from "../indexer";

import {
  TransactionData,
  CreateProfileArgs,
} from "@allo-team/allo-v2-sdk/dist/types";
import { Registry } from "@allo-team/allo-v2-sdk/";

export class AlloV2 implements Allo {
  private transactionSender: TransactionSender;
  private ipfsUploader: IpfsUploader;
  private waitUntilIndexerSynced: WaitUntilIndexerSynced;
  private chainId: number;
  private registry: Registry;

  constructor(args: {
    chainId: number;
    transactionSender: TransactionSender;
    projectRegistryAddress: Address; // todo: not used, handled by sdk
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
  }

  createProject(args: {
    name: string;
    metadata: Record<string, unknown>;
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

      const randomNonce: number = Math.floor(Math.random() * 1000000) + 1000000;

      const createProfileData: CreateProfileArgs = {
        nonce: randomNonce,
        name: args.name,
        metadata: {
          protocol: BigInt(1),
          pointer: ipfsResult.value,
        },
        owner: await this.transactionSender.address(),
        members: [], // todo: get members
      };

      const txCreateProfile: TransactionData =
        this.registry.createProfile(createProfileData);

      // --- send transaction to create project
      const txResult = await sendRawTransaction(this.transactionSender, {
        to: txCreateProfile.to,
        data: txCreateProfile.data,
        value: BigInt(txCreateProfile.value),
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
        abi: RegistryABI,
        receipt,
        event: "ProfileCreated",
      });

      return success({
        projectId: projectCreatedEvent.profileId,
      });
    });
  }

  // applyToRound(args: {
  //   roundId: Hex;

  //   metadata: Record<string, unknown>;
  // }): AlloOperation<
  //   Result<{ applicationId: Hex }>,
  //   {
  //     ipfs: Result<string>;
  //     transaction: Result<Hex>;
  //     transactionStatus: Result<TransactionReceipt>;
  //   }
  // > {
  //   return new AlloOperation(async ({ emit }) => {

  //   });
  // }
}
