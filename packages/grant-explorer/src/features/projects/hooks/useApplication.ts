import useSWR from "swr";
import { Application, DataLayer, Project, Round } from "data-layer";
import { getConfig } from "common/src/config";
import { Address, getAddress, zeroAddress } from "viem";

type Params = {
  chainId?: number;
  roundId?: string;
  applicationId?: string;
};

const {
  allo: { version },
} = getConfig();

export function useApplication(params: Params, dataLayer: DataLayer) {
  const shouldFetch = Object.values(params).every(Boolean);
  return useSWR(shouldFetch ? ["applications", params] : null, async () => {
    const validatedParams = {
      chainId: params.chainId as number,
      applicationId: params.applicationId as string,
      roundId: getAddress(
        params.roundId ?? zeroAddress
      ).toLowerCase() as Lowercase<Address>,
    };
    return dataLayer.getApplication(validatedParams).then((application) => {
      /* Don't fetch v2 rounds when allo version is set to v1 */
      if (
        version === "allo-v1" &&
        application?.round?.tags?.includes("allo-v2")
      ) {
        return;
      }
      return application;
    });
  });
}

// These functions map the application data to fit the shape of the view
// Changing the view would require significant changes to the markup + cart storage
export function mapApplicationToProject(
  application?: Application
): Project | undefined {
  if (!application) return;
  return {
    grantApplicationId: application.id,
    applicationIndex: Number(application.id),
    projectRegistryId: application.projectId,
    recipient: application.metadata.application.recipient,
    projectMetadata: application.project.metadata,
    status: application.status,
    grantApplicationFormAnswers: application.metadata.application.answers ?? [],
  };
}

export function mapApplicationToRound(
  application?: Application
): Round | undefined {
  if (!application) return;
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
