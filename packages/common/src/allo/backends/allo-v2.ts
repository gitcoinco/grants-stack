import {
  Allo as AlloV2Contract,
  CreateProfileArgs,
  DonationVotingMerkleDistributionStrategy,
  DonationVotingMerkleDistributionStrategyTypes,
  Registry,
  RegistryAbi,
  AlloAbi,
  TransactionData,
} from "@allo-team/allo-v2-sdk";
import {
  Abi,
  Address,
  Hex,
  encodeAbiParameters,
  parseAbiParameters,
  parseUnits,
  zeroAddress,
} from "viem";
import { AnyJson } from "../..";
import { Allo, AlloError, AlloOperation, CreateRoundArguments } from "../allo";
import { Result, dateToEthereumTimestamp, error, success } from "../common";
import { WaitUntilIndexerSynced } from "../indexer";
import { IpfsUploader } from "../ipfs";
import {
  TransactionReceipt,
  TransactionSender,
  decodeEventFromReceipt,
  sendRawTransaction,
} from "../transaction-sender";
import { RoundCategory } from "../../types";
import { CreatePoolArgs } from "@allo-team/allo-v2-sdk/dist/types";
import { payoutTokens } from "../../payoutTokens";

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
        abi: RegistryAbi as Abi,
        receipt,
        event: "ProfileCreated",
      }) as { profileId: Hex };

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
      if (args.roundData?.roundCategory !== RoundCategory.QuadraticFunding) {
        return error(
          new AlloError("Only Quadratic Funding rounds are supported")
        );
      }

      const roundIpfsResult = await this.ipfsUploader({
        roundMetadata: args.roundData.roundMetadataWithProgramContractAddress,
        applicationMetadata: args.roundData.applicationQuestions,
      });

      emit("ipfsStatus", roundIpfsResult);

      if (roundIpfsResult.type === "error") {
        return roundIpfsResult;
      }

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
          allowedTokens: [zeroAddress], // allow all tokens
        };

      const initStrategyDataEncoded: `0x${string}` = encodeAbiParameters(
        parseAbiParameters(
          "(bool, bool, uint64, uint64, uint64, uint64, address[])"
        ),
        [
          [
            initStrategyData.useRegistryAnchor,
            initStrategyData.metadataRequired,
            initStrategyData.registrationStartTime,
            initStrategyData.registrationEndTime,
            initStrategyData.allocationStartTime,
            initStrategyData.allocationEndTime,
            initStrategyData.allowedTokens,
          ],
        ]
      );

      const tokenAmount = args.roundData.matchingFundsAvailable ?? 0;
      const payoutToken = payoutTokens.filter(
        (t) => t.address.toLowerCase() === args.roundData.token.toLowerCase()
      )[0];

      const matchAmount = parseUnits(
        tokenAmount.toString(),
        payoutToken.decimal
      );

      const profileId =
        args.roundData.roundMetadataWithProgramContractAddress
          ?.programContractAddress;

      if (!profileId) {
        throw new Error("Program contract address is required");
      }

      const createPoolArgs: CreatePoolArgs = {
        profileId,
        strategy: zeroAddress,
        initStrategyData: initStrategyDataEncoded,
        token: args.roundData.token,
        amount: matchAmount,
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

      try {
        receipt = await this.transactionSender.wait(txResult.value);
        await this.waitUntilIndexerSynced({
          chainId: this.chainId,
          blockNumber: receipt.blockNumber,
        });

        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to create Pool");
        emit("transactionStatus", error(result));
        return error(result);
      }

      const projectCreatedEvent = decodeEventFromReceipt({
        abi: AlloAbi as Abi,
        receipt,
        event: "PoolCreated",
      }) as { poolId: Hex };

      return success({
        roundId: projectCreatedEvent.poolId,
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

      const strategyInstance = new DonationVotingMerkleDistributionStrategy({
        chain: this.chainId,
        poolId: args.roundId,
      });

      const ipfsResult = await this.ipfsUploader(args.metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      const metadata = args.metadata as unknown as {
        application: { recipient: Hex };
      };

      const registerRecipientTx = strategyInstance.getRegisterRecipientData({
        registryAnchor: args.projectId,
        recipientAddress: metadata.application.recipient,
        metadata: {
          protocol: 1n,
          pointer: ipfsResult.value,
        },
      });

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
}
