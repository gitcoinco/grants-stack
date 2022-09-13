/* eslint-disable import/prefer-default-export */
// This just disables default export as this utils file will be intended to return multiple utils
import { getAddress } from "@ethersproject/address";
import { ethers } from "ethers";
import { chains } from "../contracts/deployments";

export function shortAddress(address: string): string {
  try {
    const formattedAddress = getAddress(address);
    return `${formattedAddress.substring(0, 6)}...${formattedAddress.substring(
      38
    )}`;
  } catch (e) {
    console.log(e, "There was an error processing your address");
    return "Invalid Address";
  }
}

export const networkPrettyNames: { [key: string]: string } = {
  goerli: "Goerli",
  optimisticKovan: "Optimistic Kovan",
};
export function networkPrettyName(chainId: number): string {
  const rawName = chains[chainId];

  return networkPrettyNames[rawName];
}

export function isValidAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}
