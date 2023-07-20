import { datadogRum } from "@datadog/browser-rum";
import { getAddress } from "@ethersproject/address";
import { ChainId } from "common";
import { ethers } from "ethers";
import PGNIcon from "common/src/icons/PublicGoodsNetwork.svg";
import {
  EthDiamondGlyph,
  FantomFTMLogo,
  FTMTestnet,
  OPIcon,
  WhiteEthIconFilledCircle,
} from "../assets";
import { ChainName, chains } from "../contracts/deployments";

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

export const networkPrettyNames: { [key in ChainName]: string } = {
  mainnet: "Mainnet",
  goerli: "Goerli",
  fantomTestnet: "Fantom Testnet",
  fantom: "Fantom",
  optimism: "Optimism",
  localhost: "Localhost",
  pgnTestnet: "PGN Testnet",
  pgn: "PGN",
};

export const networkIcon: { [key in ChainName]: string } = {
  mainnet: EthDiamondGlyph,
  goerli: EthDiamondGlyph,
  fantomTestnet: FTMTestnet,
  fantom: FantomFTMLogo,
  optimism: OPIcon,
  pgnTestnet: PGNIcon,
  pgn: PGNIcon,
  localhost: EthDiamondGlyph,
};

export const payoutIcon: { [key in ChainName]: string } = {
  mainnet: WhiteEthIconFilledCircle,
  goerli: WhiteEthIconFilledCircle,
  fantomTestnet: FTMTestnet,
  fantom: FantomFTMLogo,
  optimism: OPIcon,
  pgnTestnet: PGNIcon,
  pgn: PGNIcon,
  localhost: EthDiamondGlyph,
};

export function getNetworkIcon(chainId: ChainId): string {
  const rawName = chains[chainId];

  return networkIcon[rawName];
}

export const getPayoutIcon = (chainId: ChainId): string => {
  const rawName = chains[chainId];

  return payoutIcon[rawName];
};

export function networkPrettyName(chainId: ChainId): string {
  const rawName = chains[chainId];

  return networkPrettyNames[rawName];
}

export function isValidAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}
