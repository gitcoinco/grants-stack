import useSWR from "swr";
import { Application, DataLayer } from "data-layer";
import { Address, getAddress, zeroAddress } from "viem";

type Params = {
  chainId?: number;
  roundId?: string;
  projectIds?: string[];
};

export function useRoundApprovedApplications(
  params: Params,
  dataLayer: DataLayer
) {
  const shouldFetch = Object.values(params).every(Boolean);
  return useSWR(
    shouldFetch ? ["allApprovedApplications", params] : null,
    async () => {
      const validatedParams = (projectId: string) => {
        return {
          chainId: params.chainId as number,
          roundId: getAddress(
            params.roundId ?? zeroAddress
          ).toLowerCase() as Lowercase<Address>,
          applicationId: projectId as string,
        };
      };
      if (!params.projectIds) return;

      const arr = params.projectIds?.map((projectId) => {
        return dataLayer.getApplication(validatedParams(projectId));
      });
      return Promise.all(arr).then(
        (applications) =>
          applications.filter(
            (application) => application?.status === "APPROVED"
          ) as Application[] | undefined
      );
    }
  );
}
