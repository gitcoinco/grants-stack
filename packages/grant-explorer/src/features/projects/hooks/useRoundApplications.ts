import useSWR from "swr";
import { DataLayer } from "data-layer";

type Params = {
  chainId?: number;
  roundId?: string;
};

export function useRoundApprovedApplications(
  params: Params,
  dataLayer: DataLayer
) {
  const shouldFetch = Object.values(params).every(Boolean);
  return useSWR(
    shouldFetch ? ["allApprovedApplications", params] : null,
    async () => {
      if (params.chainId === undefined || params.roundId === undefined) {
        return null;
      }

      return await dataLayer.getApplicationsForExplorer({
        roundId: params.roundId,
        chainId: params.chainId,
      });
    }
  );
}
