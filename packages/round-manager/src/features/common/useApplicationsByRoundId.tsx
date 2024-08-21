import { useAccount } from "wagmi";
import { useDataLayer } from "data-layer";
import useSWR from "swr";
import { convertApplications } from "../api/utils";

export const useApplicationsByRoundId = (roundId: string) => {
  const dataLayer = useDataLayer();
  const { chainId } = useAccount();

  return useSWR(
    [roundId, chainId],
    async () => {
      if (!chainId) {
        console.error(
          `Chain ID is not set for round ${roundId} in useApplicationsByRoundId`
        );
        return [];
      }
      const dataLayerApplications = await dataLayer.getApplicationsForManager({
        roundId,
        chainId,
      });

      return convertApplications(dataLayerApplications);
    },
    {
      onError: (error) => {
        console.error("useApplicationsByRoundId", error);
      },
    }
  );
};
