import useSWR from "swr";
import { DataLayer } from "data-layer";
import { AlloVersion } from "data-layer/src/data-layer.types";

type Params = {
  projectId?: string;
};

export function useProject(params: Params, dataLayer: DataLayer) {
  const shouldFetch = Object.values(params).every(Boolean);
  return useSWR(shouldFetch ? ["applications", params] : null, async () => {
    const validatedParams = {
      projectId: params.projectId as string,
      alloVersion: "allo-v2" as AlloVersion,
    };
    return (await dataLayer.getProjectById(validatedParams)) ?? undefined;
  });
}
