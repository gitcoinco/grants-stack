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

export function formatTimeAgo(dateString : number) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime()); // Difference in milliseconds
  const diffMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30)); // Convert to months

  if (diffMonths === 0) {
    return 'This month';
  } else if (diffMonths === 1) {
    return 'Last month';
  } else {
    return `${diffMonths} months`;
  }
}
