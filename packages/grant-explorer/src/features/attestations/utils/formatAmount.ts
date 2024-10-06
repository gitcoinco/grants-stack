import { formatEther } from "viem";

export function formatAmount(amount: bigint | undefined) {
  return (amount ? Number(formatEther(amount)) : 0).toFixed(5);
}
