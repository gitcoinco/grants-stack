import useSWR from "swr";
import { DataLayer } from "data-layer";

type Params = {
  projectId: string;
};

export function useProject(params: Params, dataLayer: DataLayer) {
  return useSWR(["projects", params], async () => {
    const validatedParams = {
      projectId: params.projectId,
      alloVersion: "allo-v2" as const,
    };
    return (await dataLayer.getProjectById(validatedParams)) ?? undefined;
  });
}

export function useProjectApplications(params: Params, dataLayer: DataLayer) {
  return useSWR(["applications", params], async () => {
    const validatedParams = {
      projectId: params.projectId,
    };
    return (
      (await dataLayer.getApplicationsByProjectId(validatedParams)) ?? undefined
    );
  });
}
