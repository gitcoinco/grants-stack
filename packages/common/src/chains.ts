import { zeroAddress } from "viem";
import { error, Result, success } from "./allo/common";
import { getChains, TChain } from "@gitcoin/gitcoin-chain-data";
import { Chain } from "@rainbow-me/rainbowkit";

const chainData = getChains();

const rpcUrls: { [key: number]: string | undefined } = {
  1: "https://eth-mainnet.g.alchemy.com/v2/",
  10: "https://opt-mainnet.g.alchemy.com/v2/",
  // 42: "", // lukso
  137: "https://polygon-mainnet.g.alchemy.com/v2/",
  // 250: "", // fantom
  300: "https://zksync-sepolia.g.alchemy.com/v2/",
  324: "https://zksync-mainnet.g.alchemy.com/v2/",
  // 4201: "", // lukso test
  1088: "https://metis-mainnet.g.alchemy.com/v2/",
  8453: "https://base-mainnet.g.alchemy.com/v2/",
  42161: "https://arb-mainnet.g.alchemy.com/v2/",
  42220: "https://celo-mainnet.infura.io/v3/", // celo
  43113: "https://avalanche-fuji.infura.io/v3/", // fuji
  43114: "https://avalanche-mainnet.infura.io/v3/", // avax
  44787: "https://celo-alfajores.infura.io/v3/", // alfajores
  // 80001: "https://polygon-mumbai.g.alchemy.com/v2/", // not supported anymore
  // 534351: "", // scroll sepol
  // 534352: "", // scroll mainnet
  // 1329: "", // sei
  // 713715: "", // sei devnet
  11155111: "https://eth-sepolia.g.alchemy.com/v2/",
};

export const getRpcUrl = (chain: TChain): string => {
  let envRpc = rpcUrls[chain.id] ?? chain.rpc;

  if (envRpc.includes("alchemy"))
    envRpc = process.env.REACT_APP_ALCHEMY_ID
      ? envRpc + process.env.REACT_APP_ALCHEMY_ID
      : chain.rpc;
  if (envRpc.includes("infura"))
    envRpc = process.env.REACT_APP_INFURA_ID
      ? envRpc + process.env.REACT_APP_INFURA_ID
      : chain.rpc;

  return envRpc;
};
export function stringToBlobUrl(data: string): string {
  const blob = new Blob([data], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  return url;
}

const parseRainbowChain = (chain: TChain) => {
  const nativeToken = chain.tokens.find(
    (token) => token.address === zeroAddress
  );

  const rpc = getRpcUrl(chain);

  // Map the TChain to @rainbow-me/rainbowkit/Chain
  const mappedChain: Chain = {
    id: chain.id,
    name: chain.prettyName,
    iconUrl: stringToBlobUrl(chain.icon),
    iconBackground: "rgba(255, 255, 255, 0)",
    nativeCurrency: {
      name: nativeToken?.code as string,
      symbol: nativeToken?.code as string,
      decimals: nativeToken?.decimals as number,
    },
    rpcUrls: {
      default: {
        http: [rpc],
        webSocket: undefined,
      },
      public: {
        http: [chain.rpc],
        webSocket: undefined,
      },
    },
  } as const satisfies Chain;
  return mappedChain;
};

export const allNetworks = chainData.map(parseRainbowChain);
export const testnetNetworks = chainData
  .filter((chain) => chain.type === "testnet")
  .map(parseRainbowChain);
export const mainnetNetworks = chainData
  .filter((chain) => chain.type === "mainnet")
  .map(parseRainbowChain);

export const chainIds = chainData.map((chain) => chain.id);
export const redstoneTokenIds = chainData
  .flatMap((chain) => chain.tokens.map((token) => token.redstoneTokenId))
  .filter((tokenId) => tokenId !== undefined)
  .reduce(
    (acc, tokenId) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc[tokenId!] = tokenId!;
      return acc;
    },
    {} as { [key: string]: string }
  );

export function parseChainIdIntoResult(input: string | number): Result<number> {
  if (typeof input === "string") {
    // If the input is a string, try to parse it as a number
    const parsedInput = parseInt(input, 10);
    if (!isNaN(parsedInput)) {
      // If parsing is successful, check if it's a valid enum value
      if (Object.values(chainIds).includes(parsedInput)) {
        return success(parsedInput as number);
      }
    }
  } else {
    // If the input is a number, check if it's a valid enum value
    if (Object.values(chainIds).includes(input)) {
      return success(input as number);
    }
  }
  return error(new Error("Invalid chainid"));
}

export function parseChainId(input: string | number): number {
  if (typeof input === "string") {
    // If the input is a string, try to parse it as a number
    const parsedInput = parseInt(input, 10);
    if (!isNaN(parsedInput)) {
      // If parsing is successful, check if it's a valid enum value
      if (Object.values(chainIds).includes(parsedInput)) {
        return parsedInput as number;
      }
    }
  } else if (typeof input === "number") {
    // If the input is a number, check if it's a valid enum value
    if (Object.values(chainIds).includes(input)) {
      return input as number;
    }
  }

  // If the input is not a valid enum value, return undefined
  throw "Invalid chainId " + input;
}
