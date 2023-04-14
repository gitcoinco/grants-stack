import ProjectRegistryABI from "./abis/ProjectRegistry.json";
import { ethers } from "ethers";
import { Provider } from "@wagmi/core";
import { Web3Provider } from "@ethersproject/providers";

export const fetchProjectOwners = async (
  provider: Provider | Web3Provider,
  chainID: number,
  projectID: number,
): Promise<string[]> => {
  const addresses = addressesByChainID(chainID);

  const projectRegistry = new ethers.Contract(
    addresses.projectRegistry!,
    ProjectRegistryABI,
    provider,
  );
  return (await projectRegistry.getProjectOwners(projectID)) as string[];
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};

export const chains: { [key: number]: string } = {
  31337: "localhost",
  5: "goerli",
  10: "optimism",
  69: "optimisticKovan", // todo: update to 420: "optimisticGoerli"
  4002: "fantomTestnet",
  250: "fantom",
  1: "mainnet",
};

export const addresses: DeploymentAddress = {
  localhost: {
    projectRegistry: "0x832c5391dc7931312CbdBc1046669c9c3A4A28d5",
  },
  optimism: {
    projectRegistry: "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174",
  },
  mainnet: {
    projectRegistry: "0x03506eD3f57892C85DB20C36846e9c808aFe9ef4",
  },
  goerli: {
    projectRegistry: "0xa71864fAd36439C50924359ECfF23Bb185FFDf21",
  },
  fantomTestnet: {
    projectRegistry: "0x984749e408FF0446d8ADaf20E293F2F299396631",
  },
  fantom: {
    projectRegistry: "0x8e1bD5Da87C14dd808F7ecc2aBf9D1d558ea174",
  },
};

export type DeploymentAddress = {
  [key: string]: {
    projectRegistry: string | undefined;
  };
};
