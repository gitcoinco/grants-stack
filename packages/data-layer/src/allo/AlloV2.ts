import EventEmitter from "events";
import {
  TransactionData,
  CreateProfileArgs,
  ZERO_ADDRESS,
} from "@allo-team/allo-v2-sdk/dist/types";
import { Registry } from "@allo-team/allo-v2-sdk/";

export enum AlloEvents {
  WaitForTransaction = "WaitForTransaction",
  WaitForTransactionToBeIndexed = "WaitForTransactionToBeIndexed",
  ProfileCreated = "ProfileCreated",
  IpfsUploaded = "IpfsUploaded",
}

type Response = {
  success: boolean;
  message: string;
  data?: any;
};

export type CreateProfileParams = {
  name: string;
  metadata: any;
  owner: string;
  members: string[];
};

export default class AlloV2 extends EventEmitter {
  chainId: number;
  registry: Registry;

  constructor(_chainId: number) {
    super();
    this.chainId = _chainId;
    this.registry = new Registry({
      chain: this.chainId,
    });
  }

  public async createProfile(data: CreateProfileParams): Promise<string> {
    // multiple ipfs uploads are needed for banner, logo and metadata
    const ipfsResult: Response = await uploadToIPFS(data.metadata);
    this.emit(AlloEvents.IpfsUploaded, ipfsResult.success);

    // if error return ??

    // tbd
    const randomNonce: number = Math.floor(Math.random() * 1000000) + 1000000;

    const txCreateProfile: TransactionData = await this.registry.createProfile({
      nonce: randomNonce,
      name: data.name,
      metadata: {
        protocol: BigInt(1),
        pointer: ipfsResult.data.hash,
      },
      owner: data.owner,
      members: data.members,
    });

    this.emit(AlloEvents.WaitForTransaction);
    const txResult: Response = await sendTransaction(txCreateProfile);
    this.emit(AlloEvents.ProfileCreated, txResult.success);

    // if error return ??

    this.emit(AlloEvents.WaitForTransactionToBeIndexed);
    const txIndexedResult: Response = await waitForTransactionToBeIndexed(
      txResult.data.hash,
    );
    this.emit(AlloEvents.ProfileCreated, txIndexedResult.success);

    // get and return profile id
    return "0x..";
  }
}

// =================================
// should live in a different file
// =================================

async function uploadToIPFS(data: any): Promise<Response> {
  try {
    return {
      success: true,
      message: "success",
      data: {
        hash: "",
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "error",
      data: error,
    };
  }
}

async function sendTransaction(data: TransactionData): Promise<Response> {
  try {
    return {
      success: true,
      message: "success",
      data: {
        hash: "",
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "error",
      data: error,
    };
  }
}

async function waitForTransactionToBeIndexed(
  txHash: string,
): Promise<Response> {
  try {
    return {
      success: true,
      message: "success",
      data: {
        hash: "",
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "error",
      data: error,
    };
  }
}
