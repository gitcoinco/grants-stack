import { VotingToken } from "../types";

export type PermitSignature = {
  v: number;
  r: string;
  s: string;
};
/** Given a payout token, selects the correct permit type.
 * - DAI is the old permit type without `value` and with the `allowed` prop
 * - eip2612 is the standard permit interface, as specified in https://eips.ethereum.org/EIPS/eip-2612
 *
 * Old DAI permit type is only implemented on Ethereum and Polygon PoS. Check /docs/DAI.md for more info.
 * */
export const getPermitType = (token: VotingToken): PermitType => {
  if (
    /DAI/i.test(token.name) &&
    ([1, 137, 11155111].includes(token.chainId))
  ) {
    return "dai";
  } else {
    return "eip2612";
  }
};

export type PermitType = "dai" | "eip2612";
