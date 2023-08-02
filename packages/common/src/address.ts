import { Address } from "wagmi";

export function assertAddress(value: unknown): Address {
  if (typeof value === "string" && value.slice(0, 2) === "0x") {
    return value as Address;
  } else {
    throw new Error(`Value is not an address (${value})`);
  }
}
