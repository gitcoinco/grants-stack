import { DataLayer } from "data-layer";
import useSWR from "swr";

export function usePayouts(args: {
  chainId: number;
  roundId?: string;
  projectId: string;
  dataLayer: DataLayer;
}) {
  return useSWR<
    {
      applicationIndex: number;
      amount: string;
      createdAt: string;
      txnHash: string;
      tokenAddress: string;
    }[]
  >(
    args.roundId !== undefined && args.projectId !== undefined
      ? [args.chainId, args.roundId, args.projectId]
      : null,
    async () => {
      if (args.roundId === undefined || args.projectId === undefined) {
        // If roundId or recipientId is not provided, return empty array
        return [];
      }

      const result = await args.dataLayer.getPayoutsByChainIdRoundIdProjectId({
        chainId: args.chainId,
        roundId: args.roundId,
        projectId: args.projectId,
      });

      const payouts =
        result.applications[0]
          .applicationsPayoutsByChainIdAndRoundIdAndApplicationId;

      const mappedPayouts = payouts.map((payout) => {
        return {
          applicationIndex: Number(result.applications[0].id),
          amount: payout.amount,
          createdAt: payout.timestamp,
          txnHash: payout.transactionHash,
          tokenAddress: payout.tokenAddress,
        };
      });

      return mappedPayouts;
    }
  );
}
