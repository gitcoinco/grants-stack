import useSWR from "swr";
import { DataLayer } from "data-layer";
import { AlloVersion } from "data-layer/src/data-layer.types";

type Params = {
  projectId: string;
};

export function useProject(params: Params, dataLayer: DataLayer) {
  return useSWR(["projects", params], async () => {
    const validatedParams = {
      projectId: params.projectId,
      alloVersion: "allo-v2" as AlloVersion,
    };
    return (await dataLayer.getProjectById(validatedParams)) ?? undefined;
  });
}
