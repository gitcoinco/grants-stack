import {
  AlloAbi,
  Allo as AlloV2Contract,
  CreateProfileArgs,
  DirectGrantsStrategy,
  DirectGrantsStrategyTypes,
  DonationVotingMerkleDistributionStrategy,
  DonationVotingMerkleDistributionStrategyTypes,
  Registry,
  RegistryAbi,
  TransactionData,
} from "@allo-team/allo-v2-sdk";
import { CreatePoolArgs, NATIVE } from "@allo-team/allo-v2-sdk/dist/types";
import { Abi, Address, Hex, getAddress, parseUnits, zeroAddress } from "viem";
import { AnyJson } from "../..";
import { payoutTokens } from "../../payoutTokens";
import { RoundCategory } from "../../types";
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

const STRATEGY_ADDRESSES = {
  [RoundCategory.QuadraticFunding]:
    "0x2f9920e473E30E54bD9D56F571BcebC2470A37B0",
  [RoundCategory.Direct]: "0xaC3f288a7A3efA3D33d9Dd321ad31072915D155d",
};

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

  createProject(args: {
    name: string;
    metadata: AnyJson;
    nonce?: bigint;
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

      const profileNonce: number = args.nonce
        ? Number(args.nonce)
        : Math.floor(Math.random() * 1000000) + 1000000;

      const createProfileData: CreateProfileArgs = {
        nonce: profileNonce,
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
      const roundIpfsResult = await this.ipfsUploader({
        round: args.roundData.roundMetadataWithProgramContractAddress,
        application: args.roundData.applicationQuestions,
      });

      emit("ipfsStatus", roundIpfsResult);

      if (roundIpfsResult.type === "error") {
        return roundIpfsResult;
      }

      let initStrategyDataEncoded: Address;
      let matchAmount = 0n;
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

        const tokenAmount = args.roundData.matchingFundsAvailable ?? 0;
        const payoutToken = payoutTokens.filter(
          (t) => t.address.toLowerCase() === args.roundData.token.toLowerCase()
        )[0];

        matchAmount = parseUnits(tokenAmount.toString(), payoutToken.decimal);
        token = getAddress(alloToken);
      } else if (args.roundData.roundCategory === RoundCategory.Direct) {
        const initStrategyData: DirectGrantsStrategyTypes.InitializeParams = {
          registryGating: true,
          metadataRequired: true,
          grantAmountRequired: true,
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

      const profileId =
        args.roundData.roundMetadataWithProgramContractAddress
          ?.programContractAddress;

      if (!profileId) {
        throw new Error("Program contract address is required");
      }

      const createPoolArgs: CreatePoolArgs = {
        profileId,
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
        application: { recipient: Hex };
      };

      // check the strategy type
      let strategyInstance = null;
      let registerRecipientTx = null;

      // todo: finish strategy type check

      strategyInstance = new DonationVotingMerkleDistributionStrategy({
        chain: this.chainId,
        poolId: args.roundId,
      });

      registerRecipientTx = strategyInstance.getRegisterRecipientData({
        registryAnchor: args.projectId,
        recipientAddress: metadata.application.recipient,
        metadata: {
          protocol: 1n,
          pointer: ipfsResult.value,
        },
      });

      /** End of split strategy */

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
