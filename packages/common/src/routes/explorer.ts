import { ChainId } from "../chain-ids";

export function applicationPath(p: {
  chainId: ChainId;
  roundId: string;
  applicationId: string;
}): string {
  return `/#/round/${p.chainId}/${p.roundId.toLowerCase()}/${p.applicationId}`;
}

export function collectionPath(collectionCid: string): string {
  return `/#/collections/${collectionCid}`;
}
