/* eslint-disable import/prefer-default-export */
// This just disables default export as this utils file will be intended to return multiple utils
import { datadogRum } from "@datadog/browser-rum";
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
    datadogRum.addError(e);
    console.log(e, "There was an error processing your address");
    return "Invalid Address";
  }
}

export const networkPrettyNames: { [key: string]: string } = {
  mainnet: "Mainnet",
  goerli: "Goerli",
  optimisticKovan: "Optimistic Kovan",
  fantomTestnet: "Fantom Testnet",
  fantom: "Fantom",
  optimism: "Optimism",
};

export const networkIcon: { [key: string]: string } = {
  mainnet:
    "https://ethereum.org/static/a62391514b71539906d6bd8ec820c7d8/d1ef9/eth-diamond-glyph.png",
  goerli:
    "https://ethereum.org/static/6f05d59dc633140e4b547cb92f22e781/40129/eth-diamond-purple-white.jpg",
  optimisticKovan:
    "https://ipfs.io/ipns/k51qzi5uqu5di9fpr1u08putyfwqdzwue8dbxq0047mid8hj85hfetm9bw71tv",
  fantomTestnet:
    "https://ipfs.io/ipfs/Qmf3a8sPpk8TM4x2aFCyb14SAmn2RZehiDFP7HhFMD1oLK?filename=ftm-testnet.png",
  fantom:
    "https://ipfs.io/ipfs/QmRJgxRqXUpHeskg48qeehUK97FzCAY7espZhTAVdrh9B9?filename=fantom-ftm-logo.png",
  optimism:
    "https://ipfs.io/ipns/k51qzi5uqu5di9fpr1u08putyfwqdzwue8dbxq0047mid8hj85hfetm9bw71tv",
};

export function getNetworkIcon(chainId: number): string {
  const rawName = chains[chainId];

  return networkIcon[rawName];
}

export function networkPrettyName(chainId: number): string {
  const rawName = chains[chainId];

  return networkPrettyNames[rawName];
}

export function isValidAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}
