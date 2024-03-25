import { GrantApplication } from "../../features/api/types";
import { useWallet } from "../../features/common/Auth";
import { useDataLayer } from "data-layer";
import useSWR from "swr";

export const useApplicationsByRoundId = (roundId: string) => {
  const dataLayer = useDataLayer();
  const {
    chain: { id: chainId },
  } = useWallet();

  return useSWR(
    [roundId, chainId],
    async () => {
      const dataLayerApplications = await dataLayer.getApplicationsForManager({
        roundId,
        chainId,
      });

      const applications: GrantApplication[] = dataLayerApplications.flatMap(
        (application) => {
          if (application.canonicalProject === null) {
            console.error(
              `Canonical project not found for application ${application.id}`
            );
            return [];
          }

          return [
            {
              id: application.id,
              applicationIndex: Number(application.id),
              round: application.roundId,
              status: application.status,
              metadata: application.metadata,
              project: {
                ...application.metadata.application.project,
                owners: application.canonicalProject.roles,
                id: application.projectId,
              },
              projectId: application.projectId,
              inReview: application.status === "IN_REVIEW",
              recipient: application.metadata.application.recipient,
              createdAt: "0",
              projectsMetaPtr: { protocol: 1, pointer: "" },
              payoutStrategy: {
                strategyName: application.round.strategyName,
                id: application.round.strategyAddress,
                payouts: [],
              },
              distributionTransaction: application.distributionTransaction,
              statusSnapshots: application.statusSnapshots.map((snapshot) => ({
                ...snapshot,
                updatedAt: new Date(snapshot.updatedAt),
              })),
              anchorAddress: application.anchorAddress,
              answers: application.metadata.application.answers,
            },
          ];
        }
      );

      return applications;
    },
    {
      onError: (error) => {
        console.error("useApplicationsByRoundId", error);
      },
    }
  );
};
