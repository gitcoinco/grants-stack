import { DataLayer } from "data-layer";
import useSWR from "swr";

export function usePayouts(args: {
  chainId: number;
  roundId?: string;
  recipientId?: string;
  dataLayer: DataLayer;
}) {
  return useSWR<
    {
      applicationIndex: number;
      amount: string;
      createdAt: string;
      txnHash: string;
    }[]
  >(
    args.roundId !== undefined && args.recipientId !== undefined
      ? [args.chainId, args.roundId, args.recipientId]
      : null,
    async () => {
      if (args.roundId === undefined || args.recipientId === undefined) {
        // If roundId or recipientId is not provided, return empty array
        return [];
      }

      const result = await args.dataLayer.getPayoutsByChainIdRoundIdRecipientId(
        {
          chainId: args.chainId,
          roundId: args.roundId,
          recipientId: args.recipientId,
        }
      );

      const payouts =
        result.applications[0]
          .applicationsPayoutsByChainIdAndRoundIdAndApplicationId;

      const mappedPayouts = payouts.map((payout) => {
        return {
          applicationIndex: Number(result.applications[0].id),
          amount: payout.amount,
          createdAt: payout.timestamp,
          txnHash: payout.transactionHash,
        };
      });

      return mappedPayouts;
    }
  );
}
