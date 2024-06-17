import useSWR from "swr";
import { DataLayer } from "data-layer";

type Params = {
  first: number;
  offset: number;
};

export function useProjects(params: Params, dataLayer: DataLayer) {
  return useSWR(["projects", params], async () => {
    const validatedParams = {
      first: params.first,
      offset: params.offset,
    };
    return (await dataLayer.getPaginatedProjects(validatedParams)) ?? undefined;
  });
}
