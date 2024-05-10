import type { AllocationAdapter, Adapter } from "./adapter";
import alloV2QF from "./adapters/allov2.QF";

export const adapters: { [key: string]: Adapter } = {
  "allov2.DonationVotingMerkleDistributionDirectTransferStrategy": alloV2QF,
};

export function getAllocationAdapter(
  strategyName: string
): AllocationAdapter | undefined {
  return adapters[strategyName]?.allocation;
}
