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
  // Fetch legacy project ID first
  const { data: legacyProjectId } = useSWR(
    ["v1ProjectId", params],
    async () => {
      const validatedParams = {
        projectId: params.projectId,
      };
      return (await dataLayer.getLegacyProjectId(validatedParams)) ?? undefined;
    }
  );

  // Fetch project applications based on both v2 and legacy project IDs
  const projectIds = legacyProjectId
    ? [params.projectId, legacyProjectId]
    : [params.projectId];

  const { data: applications, error } = useSWR(
    ["applications", { projectIds }],
    async () => {
      const validatedParams = {
        projectIds: projectIds,
      };
      return (
        (await dataLayer.getApprovedApplicationsByProjectIds(
          validatedParams
        )) ?? undefined
      );
    }
  );
  return {
    applications,
    isLoading: !applications && !error,
    error,
  };
}
