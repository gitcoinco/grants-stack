import { Address } from "wagmi";
import { ChainId } from "../chain-ids";

export function applicationPath(p: {
  chainId: ChainId;
  roundId: Address;
  applicationId: string;
}): string {
  return `/#/round/${
    p.chainId
  }/${p.roundId.toLowerCase()}/${p.roundId.toLowerCase()}-${p.applicationId}`;
}
