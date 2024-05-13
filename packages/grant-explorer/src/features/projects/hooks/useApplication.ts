import useSWR from "swr";
import { Application, DataLayer, Project, Round } from "data-layer";

type Params = {
  chainId?: number;
  roundId?: string;
  applicationId?: string;
};

export function useApplication(params: Params, dataLayer: DataLayer) {
  const shouldFetch = Object.values(params).every(Boolean);
  return useSWR(shouldFetch ? ["applications", params] : null, async () => {
    const validatedParams = {
      chainId: params.chainId as number,
      applicationId: params.applicationId as string,
      roundId: params.roundId as string,
    };
    return (
      (await dataLayer.getApprovedApplication(validatedParams)) ?? undefined
    );
  });
}

// These functions map the application data to fit the shape of the view
// Changing the view would require significant changes to the markup + cart storage
export function mapApplicationToProject(application: Application): Project {
  return {
    grantApplicationId: application.id,
    applicationIndex: Number(application.id),
    projectRegistryId: application.projectId,
    recipient: application.metadata.application.recipient,
    projectMetadata: application.project.metadata,
    status: application.status,
    grantApplicationFormAnswers: application.metadata.application.answers ?? [],
    anchorAddress: application.anchorAddress,
  };
}

export function mapApplicationToRound(application: Application): Round {
  return {
    roundEndTime: new Date(application.round.donationsEndTime),
    roundStartTime: new Date(application.round.donationsStartTime),
    applicationsStartTime: new Date(application.round.applicationsStartTime),
    applicationsEndTime: new Date(application.round.applicationsEndTime),
    roundMetadata: application.round.roundMetadata,
    token: application.round.matchTokenAddress,
    payoutStrategy: {
      id: "id",
      strategyName: application.round.strategyName,
    },
    // These might not be used anywhere in the app
    votingStrategy: "",
    ownedBy: "",
  };
}
