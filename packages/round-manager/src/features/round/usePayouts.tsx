import { graphql_fetch } from "common";
import useSWR from "swr";

export function usePayouts(args: {
  chainId: number;
  roundId?: string;
  applicationIndex?: number;
}) {
  return useSWR<
    {
      applicationIndex: number;
      amount: string;
      createdAt: string;
      txnHash: string;
    }[]
  >(
    args.roundId !== undefined && args.applicationIndex !== undefined
      ? [args.chainId, args.roundId, args.applicationIndex]
      : null,
    async () => {
      const res = await graphql_fetch(
        `
        query GetApplicationsByRoundId($roundId: String!, $applicationIndex: Int!) {
          roundApplications(where: {
            round: $roundId
            applicationIndex: $applicationIndex
          }) {
            round {
              payoutStrategy {
                payouts {
                  amount
                  createdAt
                  txnHash
                  applicationIndex
                }
              }
            }
          }
        }
      `,
        args.chainId,
        { roundId: args.roundId, applicationIndex: args.applicationIndex }
      );

      return res.data.roundApplications[0].round.payoutStrategy.payouts ?? [];
    }
  );
}
