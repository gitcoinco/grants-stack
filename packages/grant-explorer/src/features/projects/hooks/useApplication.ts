import useSWR from "swr";
<<<<<<< HEAD
import { Application, DataLayer, Project, Round } from "data-layer";
import { getConfig } from "common/src/config";
import { Address, getAddress, zeroAddress } from "viem";
=======
import {
  ApplicationStatus,
  GrantApplicationFormAnswer,
  Project,
  ProjectMetadata,
  Round,
  RoundMetadata,
} from "data-layer";
import { getConfig } from "common/src/config";
>>>>>>> main

type Params = {
  chainId?: number;
  roundId?: string;
  applicationId?: string;
};

const {
<<<<<<< HEAD
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
=======
  dataLayer: { gsIndexerEndpoint },
  allo: { version },
} = getConfig();

const allo_v2_url = gsIndexerEndpoint + "/graphql";

const APPLICATION_QUERY = `
query Application($chainId: Int!, $applicationId: String!, $roundId: String!) {
  application(chainId: $chainId, id: $applicationId, roundId: $roundId) {
    id
    chainId
    roundId
    projectId
    status
    totalAmountDonatedInUsd
    uniqueDonorsCount
    round {
      donationsStartTime
      donationsEndTime
      applicationsStartTime
      applicationsEndTime
      matchTokenAddress
      roundMetadata
    }
    metadata
    project {
      tags
      id
      metadata
    }
  }
}
`;

export type Application = {
  id: string;
  chainId: string;
  roundId: string;
  projectId: string;
  status: ApplicationStatus;
  totalAmountDonatedInUsd: string;
  totalDonationsCount: string;
  round: {
    donationsStartTime: string;
    donationsEndTime: string;
    applicationsStartTime: string;
    applicationsEndTime: string;
    roundMetadata: RoundMetadata;
    matchTokenAddress: string;
  };
  project: {
    id: string;
    metadata: ProjectMetadata;
  };
  metadata: {
    application: {
      recipient: string;
      answers: GrantApplicationFormAnswer[];
    };
  };
};

export function useApplication(params: Params) {
  const shouldFetch = Object.values(params).every(Boolean);
  return useSWR(shouldFetch ? ["applications", params] : null, async () => {
    return request(allo_v2_url, {
      query: APPLICATION_QUERY,
      variables: params,
    })
      .then((r) => r.data?.application)
      .then((application) => {
        /* Don't fetch v2 rounds when allo version is set to v1 */
        if (
          version === "allo-v1" &&
          application.project.tags.includes("allo-v2")
        ) {
          return;
        }
        return application;
      });
>>>>>>> main
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
    // This is missing from the indexer
    payoutStrategy: {
      id: "id",
      strategyName: "MERKLE",
    },
    // These might not be used anywhere in the app
    votingStrategy: "",
    ownedBy: "",
  };
}
<<<<<<< HEAD
=======

async function request(url: string, body: unknown) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return await res.json();
  });
}
>>>>>>> main
