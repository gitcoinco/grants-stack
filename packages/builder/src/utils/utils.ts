import { ChainId } from "common";
import { BigNumberish, ethers } from "ethers";
import gnosisABI from "../contracts/abis/gnosis.json";
import { global } from "../global";
import { AddressType, Metadata, Project } from "../types";

/**
 * Parse a round to apply string
 *
 * @remarks
 *
 * This function parses a round to apply string into its components.
 *
 * @param s The round to apply string
 *
 * @returns The chain ID and round address
 */
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

/**
 * Converts a metadata object to a project object
 *
 * @param m The metadata object
 * @param lastUpdated The last updated timestamp
 *
 * @returns The project object
 */
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

/**
 * Get the provider for a given chain ID
 *
 * @param chainId
 *
 * @returns The provider
 */
export const getProviderByChainId = (chainId: ChainId) => {
  const { web3Provider } = global;

  const chainConfig = web3Provider?.chains?.find(
    // Yes, parameter type for chainId is number, but sometimes we pass it as a string
    // so adding a cast to Number just in case
    (i) => i.id === Number(chainId)
  );

  if (!chainConfig) {
    console.log(`chainConfig not found for chain ID ${chainId}`);
    return undefined;
  }

  // TODO: Create a more robust RPC here to avoid fails
  return ethers.getDefaultProvider(chainConfig.rpcUrls.default.http[0]);
};

/**
 * Get the address type of an address
 *
 * @remarks
 *
 * This function checks if the address is a contract and if it is a safe.
 *
 * @param address
 *
 * @returns The address type
 */
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
