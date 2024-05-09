import type { AllocationAdapter, Adapter } from "./adapter";
import allov2DonationVotingMerkleDistributionDirectTransferStrategy from "./adapters/allov2.DonationVotingMerkleDistributionDirectTransferStrategy";

export const adapters: { [key: string]: Adapter } = {
  "allov2.DonationVotingMerkleDistributionDirectTransferStrategy":
    allov2DonationVotingMerkleDistributionDirectTransferStrategy,
};

export function getAllocationAdapter(
  strategyName: string
): AllocationAdapter | undefined {
  return adapters[strategyName]?.allocation;
}
