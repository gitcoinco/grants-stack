import { DataLayer } from "data-layer";
import useSWR from "swr";
import { zeroAddress } from "viem";

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

      const payouts = result.applications[0].applicationsPayouts;

      let mappedPayouts = payouts.map((payout) => {
        return {
          applicationIndex: Number(result.applications[0].id),
          amount: Number(payout.amount).toLocaleString("fullwide", {
            useGrouping: false,
          }),
          createdAt: payout.timestamp,
          txnHash: payout.transactionHash,
          tokenAddress: payout.tokenAddress,
        };
      });

      if (!args.roundId.startsWith("0x")) {
        mappedPayouts = mappedPayouts.filter(
          (p) => p.tokenAddress !== zeroAddress
        );
      }

      return mappedPayouts;
    }
  );
}
