import { Hex } from "viem";
import RegistryABI from "../abis/allo-v2/Registry";
import { Allo, AlloError, AlloOperation } from "../allo";
import { Result, error, success } from "../common";
import { WaitUntilIndexerSynced } from "../indexer";
import { IpfsUploader } from "../ipfs";
import {
  TransactionReceipt,
  TransactionSender,
  decodeEventFromReceipt,
  sendRawTransaction,
} from "../transaction-sender";

import { Allo as AlloSDK, Registry } from "@allo-team/allo-v2-sdk/";
import {
  CreateProfileArgs,
  TransactionData,
} from "@allo-team/allo-v2-sdk/dist/types";
import { AnyJson } from "../..";

/**
 * Allo v2 implementation of Allo
 *
 * @public
 *
 * @implements Allo
 *
 * @remarks
 *
 * This class is the implementation of Allo for Allo v2
 *
 * @example
 *
 * ```typescript
 * const allo = new AlloV2({
 *   chainId: 1,
 *   transactionSender: new TransactionSender(),
 *   ipfsUploader: new IpfsUploader(),
 *   waitUntilIndexerSynced: new WaitUntilIndexerSynced(),
 * });
 * ```
 */
export class AlloV2 implements Allo {
  private transactionSender: TransactionSender;
  private ipfsUploader: IpfsUploader;
  private waitUntilIndexerSynced: WaitUntilIndexerSynced;
  private chainId: number;
  private registry: Registry;
  private allo: AlloSDK;

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
    this.allo = new AlloSDK({
      chain: this.chainId,
    });
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

      const randomNonce: number = Math.floor(Math.random() * 1000000) + 1000000;

      const createProfileData: CreateProfileArgs = {
        nonce: randomNonce,
        name: args.name,
        metadata: {
          protocol: 1n,
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

        await this.waitUntilIndexerSynced({
          chainId: this.chainId,
          blockNumber: receipt.blockNumber,
        });

        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to create project");
        emit("transactionStatus", error(result));
        return error(result);
      }

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

      // --- upload metadata to IPFS
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

      // --- send transaction to create project
      const txResult = await sendRawTransaction(this.transactionSender, {
        to: txUpdateProfile.to,
        data: txUpdateProfile.data,
        value: BigInt(txUpdateProfile.value),
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
        projectId: projectId,
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
  applyToRoundV2(args: {
    projectId: Hex;
    strategy: Hex;
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
      const ipfsResult = await this.ipfsUploader(args.metadata);

      console.log("ipfsResult", ipfsResult);

      //   const metadata = {
      //     name: data.name,
      //     website: data.website,
      //     description: data.description,
      //     email: data.email,
      //     base64Image: data.base64Image,
      //   };

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      // const data = {
      //   projectId: args.projectId,
      //   strategy: args.strategy,
      //   metadata: ipfsResult.value,
      // };

      // todo: finish updating to use SDK to apply to round
      // note: we need the poolId to apply to a round for v2 and for 
      // grants stack we don't have support for DirectGrants yet in our SDK.
      const txApplyToRound: any = this.allo.registerRecipient(1, "0x");

      const txResult = await sendRawTransaction(this.transactionSender, {
        to: txApplyToRound.to,
        data: txApplyToRound.data,
        value: txApplyToRound.value,
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
}

// let profileId = data.profileId;

//   // 2. Save metadata to IPFS
//   const ipfsClient = getIPFSClient();

//   const metadata = {
//     name: data.name,
//     website: data.website,
//     description: data.description,
//     email: data.email,
//     base64Image: data.base64Image,
//   };

//   let imagePointer;
//   let pointer;

//   try {
//     if (metadata.base64Image.includes("base64")) {
//       imagePointer = await ipfsClient.pinJSON({
//         data: metadata.base64Image,
//       });
//       metadata.base64Image = imagePointer.IpfsHash;
//     }

//     pointer = await ipfsClient.pinJSON(metadata);

//     console.log("Metadata saved to IPFS with pointer: ", pointer);
//   } catch (e) {
//     console.error("IPFS", e);
//   }

//   // 3. Register application to pool
//   let recipientId;
//   const strategy = new MicroGrantsStrategy({
//     chain,
//     rpc: commonConfig.rpc,
//     poolId,
//   });
//   let anchorAddress: string = ZERO_ADDRESS;

//   // Get the anchor address for the profileId
//   if (ethereumHashRegExp.test(profileId || "")) {
//     anchorAddress = (
//       await getProfileById({
//         chainId: chain.toString(),
//         profileId: profileId!.toLowerCase(),
//       })
//     ).anchor;
//   }

//   console.log("anchorAddress", anchorAddress);

//   // todo: snippet => getRegisterRecipientData
//   const registerRecipientData = strategy.getRegisterRecipientData({
//     registryAnchor: anchorAddress as `0x${string}`,
//     recipientAddress: commonConfig.recipientId,
//     requestedAmount: data.requestedAmount,
//     metadata: {
//       protocol: BigInt(1),
//       pointer: pointer.IpfsHash,
//     },
//   });

//   console.log("registerRecipientData", registerRecipientData);

//   try {
//     const tx = await sendTransaction({
//       to: registerRecipientData.to as string,
//       data: registerRecipientData.data,
//       value: BigInt(registerRecipientData.value),
//     });

//     const reciept =
//       await wagmiConfigData.publicClient.waitForTransactionReceipt({
//         hash: tx.hash,
//       });

//     const { logs } = reciept;
//     const decodedLogs = logs.map((log) =>
//       decodeEventLog({ ...log, abi: MicroGrantsABI })
//     );

//     let log = extractLogByEventName(decodedLogs, "Registered");
//     if (!log) {
//       log = extractLogByEventName(decodedLogs, "UpdatedRegistration");
//     }

//     recipientId = log.args["recipientId"].toLowerCase();
//   } catch (e) {
//     console.error("Error Registering Application", e);
//   }

//   // 4. Poll indexer for recipientId
//   const pollingData: any = {
//     chainId: chain,
//     poolId: poolId,
//     recipientId: recipientId.toLowerCase(),
//   };
//   const pollingResult: boolean = await pollUntilDataIsIndexed(
//     checkIfRecipientIsIndexedQuery,
//     pollingData,
//     "microGrantRecipient"
//   );

//   if (pollingResult) {
//     // do something with result...
//   } else {
//     console.error("Polling ERROR");
//   }

//   // 5. Index Metadata
//   const pollingMetadataResult = await pollUntilMetadataIsAvailable(
//     pointer.IpfsHash
//   );

//   if (pollingMetadataResult) {
//     // do something with result...
//   } else {
//     console.error("Polling ERROR");
//   }

//   await new Promise((resolve) => setTimeout(resolve, 3000));

//   return recipientId;
