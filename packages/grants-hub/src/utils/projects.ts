/* eslint-disable import/prefer-default-export */
import { ethers } from "ethers";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { getProviderByChainId } from "./utils";
import { addressesByChainID } from "../contracts/deployments";

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
