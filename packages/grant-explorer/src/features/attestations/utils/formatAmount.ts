import { formatEther } from "viem";

export function formatAmount(amount: bigint | undefined, decimals = 5): string {
  return (amount ? Number(formatEther(amount)) : 0).toFixed(decimals);
}
