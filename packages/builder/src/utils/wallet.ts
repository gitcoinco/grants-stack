import { datadogRum } from "@datadog/browser-rum";
import { getAddress } from "@ethersproject/address";
import { ChainId } from "common";
import { ethers } from "ethers";
import PGNIcon from "common/src/icons/PublicGoodsNetwork.svg";
import AVAXIcon from "common/src/icons/AVAX.svg";
import POLIcon from "common/src/icons/pol-logo.svg";
import FantomFTMLogo from "common/src/assets/fantom-ftm-logo.png";
import {
  EthDiamondGlyph,
  FTMTestnet,
  OPIcon,
  WhiteEthIconFilledCircle,
  ARBIcon,
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
  dev1: "Development 1",
  dev2: "Development 2",
  mainnet: "Mainnet",
  goerli: "Goerli",
  fantomTestnet: "Fantom Testnet",
  fantom: "Fantom",
  optimism: "Optimism",
  localhost: "Localhost",
  pgnTestnet: "PGN Testnet",
  pgn: "PGN",
  arbitrum: "Arbitrum",
  arbitrumGoerli: "Arbitrum Goerli",
  avalanche: "Avalanche",
  fuji: "Fuji (Avalanche Testnet)",
  polygon: "Polygon PoS",
  polygonMumbai: "Polygon Mumbai",
};

export const networkIcon: { [key in ChainName]: string } = {
  dev1: EthDiamondGlyph,
  dev2: EthDiamondGlyph,
  mainnet: EthDiamondGlyph,
  goerli: EthDiamondGlyph,
  fantomTestnet: FTMTestnet,
  fantom: FantomFTMLogo,
  optimism: OPIcon,
  pgnTestnet: PGNIcon,
  pgn: PGNIcon,
  localhost: EthDiamondGlyph,
  arbitrum: ARBIcon,
  arbitrumGoerli: ARBIcon,
  avalanche: AVAXIcon,
  fuji: AVAXIcon,
  polygon: POLIcon,
  polygonMumbai: POLIcon,
};

export const payoutIcon: { [key in ChainName]: string } = {
  dev1: WhiteEthIconFilledCircle,
  dev2: WhiteEthIconFilledCircle,
  mainnet: WhiteEthIconFilledCircle,
  goerli: WhiteEthIconFilledCircle,
  fantomTestnet: FTMTestnet,
  fantom: FantomFTMLogo,
  optimism: OPIcon,
  pgnTestnet: PGNIcon,
  pgn: PGNIcon,
  localhost: EthDiamondGlyph,
  arbitrumGoerli: ARBIcon,
  arbitrum: ARBIcon,
  polygon: POLIcon,
  polygonMumbai: POLIcon,
  avalanche: AVAXIcon,
  fuji: AVAXIcon,
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
