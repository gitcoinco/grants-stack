import { getAddress } from "ethers/lib/utils.js";

export const getFormattedRoundId = (roundId?: string | number): string => {
  if (roundId === undefined) {
    return "";
  }
  if (typeof roundId === "number") {
    return roundId.toString();
  }
  if (roundId.startsWith("0x")) {
    return getAddress(roundId);
  } else {
    return roundId;
  }
};
