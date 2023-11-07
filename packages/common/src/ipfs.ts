import { getConfig } from "./config";

export function createIpfsImageUrl(args: {
  cid: string;
  height?: number;
}): string {
  const config = getConfig();
  return new URL(
    `/ipfs/${args.cid}${args.height ? `?img-height=${args.height}` : ""}`,
    config.ipfs.baseUrl
  ).toString();
}
