import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { getProviderByChainId } from "./utils";
import { addressesByChainID } from "../contracts/deployments";
import { ethers } from "ethers";

export const fetchProjectOwners = (chainID: number, projectID: string) => {
  const addresses = addressesByChainID(chainID);
  const appProvider = getProviderByChainId(chainID);

  const projectRegistry = new ethers.Contract(
    addresses.projectRegistry,
    ProjectRegistryABI,
    appProvider
  );

  return projectRegistry.getProjectOwners(projectID);
};
