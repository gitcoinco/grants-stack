export function createIpfsImageUrl(args: {
  baseUrl: string;
  cid: string;
  height?: number;
}): string {
  return new URL(
    `/ipfs/${args.cid}${args.height ? `?img-height=${args.height}` : ""}`,
    args.baseUrl
  ).toString();
}
