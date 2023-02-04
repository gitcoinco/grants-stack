import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { BigNumberish, ethers } from "ethers";
import { global } from "../global";
import { AddressType, Metadata, Project } from "../types";
import gnosisABI from "../contracts/abis/gnosis.json";

// Checks if tests are being run jest
export const isJestRunning = () => process.env.JEST_WORKER_ID !== undefined;

export const parseRoundToApply = (
  s?: string
): { chainID?: string; roundAddress?: string } => {
  let chainID;
  let roundAddress;

  if (s !== undefined) {
    [chainID, roundAddress] = s.split(":");
  }

  return { chainID, roundAddress };
};

export const metadataToProject = (
  m: Metadata,
  lastUpdated: number
): Project => {
  const p: Project = {
    lastUpdated,
    createdAt: m.createdAt,
    id: String(m.id),
    title: m.title,
    description: m.description,
    website: m.website,
    bannerImg: m.bannerImg!,
    logoImg: m.logoImg!,
    metaPtr: {
      protocol: String(m.protocol),
      pointer: m.pointer,
    },
    userGithub: m.userGithub,
    projectGithub: m.projectGithub,
    projectTwitter: m.projectTwitter,
    credentials: m.credentials,
  };

  return p;
};

export const getProjectURIComponents = (id: string) => {
  const split = id.split(":");
  if (split.length < 3) {
    datadogRum.addError("Invalid project id", { id });
    datadogLogs.logger.warn("Invalid project id", { id });
    throw new Error("Invalid project ID");
  }
  return {
    chainId: split[0],
    registryAddress: split[1],
    id: split[2],
  };
};

export const getProviderByChainId = (chainId: number) => {
  const { web3Provider } = global;

  const chainConfig = web3Provider?.chains?.find(
    // Yes, parameter type for chainId is number, but sometimes we pass it as a string
    // so adding a cast to Number just in case
    (i) => i.id === Number(chainId)
  );

  if (!chainConfig) {
    throw new Error(`chainConfig not found for chain ID ${chainId}`);
  }

  // TODO: Create a more robust RPC here to avoid fails
  return ethers.getDefaultProvider(chainConfig.rpcUrls.default);
};

export const getAddressType = async (address: string): Promise<AddressType> => {
  const { web3Provider } = global;

  const returnValue = { resolved: false, isContract: false, isSafe: false };

  if (web3Provider) {
    const addressCode = await web3Provider.getCode(address);

    returnValue.isContract = addressCode !== "0x";

    if (returnValue.isContract) {
      try {
        const safeContract = new ethers.Contract(
          address,
          gnosisABI,
          web3Provider
        );

        const nonce: BigNumberish = await safeContract.nonce();
        const nonceString = nonce.toString();

        if (nonceString) {
          returnValue.isSafe = true;
        }
      } catch (error) {
        console.log("Not a safe address");
        returnValue.isSafe = false;
      }
    }

    returnValue.resolved = true;
  }

  return returnValue;
};
