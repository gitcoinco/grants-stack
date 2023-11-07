import { Address } from "wagmi";
import { ChainId } from "./chains";

export const explorerRoutes = {
  applicationPath(chainId: ChainId, roundId: Address, applicationId: string) {
    return `/#/round/${chainId}/${roundId.toLowerCase()}/${roundId.toLowerCase()}-${applicationId}`;
  },
};
