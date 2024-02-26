import { GrantApplication } from "../../features/api/types";
import { useWallet } from "../../features/common/Auth";
import { useDataLayer } from "data-layer";
import useSWR from "swr";

export const useApplicationsByRoundId = (roundId: string) => {
  const dataLayer = useDataLayer();
  const {
    chain: { id: chainId },
  } = useWallet();

  return useSWR([roundId, chainId], async () => {
    const dataLayerApplications = await dataLayer.getApplicationsForManager({
      roundId,
      chainId,
    });

    const applications: GrantApplication[] = dataLayerApplications.map(
      (application) => {
        return {
          id: application.id,
          applicationIndex: Number(application.id),
          round: application.roundId,
          status: application.status,
          metadata: application.metadata,
          project: {
            ...application.project.metadata,
            id: application.projectId,
          },
          inReview: application.inReview,
          recipient: application.metadata.application.recipient,
          createdAt: "0",
          projectsMetaPtr: { protocol: 1, pointer: "" },
        };
      }
    );

    return applications;
  });
};
