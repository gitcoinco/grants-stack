import { datadogRum } from "@datadog/browser-rum";
import { getAddress } from "@ethersproject/address";
import { ethers } from "ethers";

export function shortAddress(address: string): string {
  try {
    const formattedAddress = getAddress(address);
    return `${formattedAddress.substring(0, 6)}...${formattedAddress.substring(
      38
    )}`;
  } catch (e) {
    datadogRum.addError(e);
    console.log(e, "There was an error processing your address");
    return "Invalid Address";
  }
}

export function isValidAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}
