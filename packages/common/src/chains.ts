import { error, Result, success } from "./allo/common";
import { getChains } from "@gitcoin/gitcoin-chain-data";

const chainData = getChains();

export const chainIds = chainData.map((chain) => chain.id);
export const redstoneTokenIds = chainData
  .flatMap((chain) => chain.tokens.map((token) => token.redstoneTokenId))
  .filter((tokenId) => tokenId !== undefined)
  .reduce((acc, tokenId) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    acc[tokenId!] = tokenId!;
    return acc;
  }, {} as { [key: string]: string });

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
