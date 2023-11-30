import useSWR from "swr";
import { applicationData } from "./__tests__/data/application";
import {
  ApplicationStatus,
  GrantApplicationFormAnswer,
  Project,
  ProjectMetadata,
  Round,
} from "../../api/types";
import { RoundMetadata } from "../../api/round";

type Params = {
  chainId?: string;
  roundId?: string;
  applicationId?: string;
};

const APPLICATION_QUERY = `
query Application($chainId: String, $applicationId: String, $roundId: String) {
  application(chainId: $chainId, id: $applicationId, roundId: $roundId) {
    id
    chainId
    roundId
    projectId
    status
    totalAmountDonatedInUsd
    totalDonationsCount
    round {
      donationsStartTime
      donationsEndTime
      applicationsStartTime
      applicationsEndTime
      matchTokenAddress
      roundMetadata
    }
    project {
      id
      metadata
    }
  }
}
`;

type Application = {
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

const indexerUrl = ""; // process.env.GC_INDEXER_URL

export function useApplication(params: Params) {
  const shouldFetch = Object.values(params).every(Boolean);
  return useSWR(shouldFetch ? ["applications", params] : null, async () => {
    return request(indexerUrl, {
      query: APPLICATION_QUERY,
      variables: params,
    }).then((r) => r.data?.application);
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

async function request(url: string, body: unknown) {
  // Temporarily mock the application data instead of calling the indexer
  return { data: applicationData };
  return fetch(indexerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      body: JSON.stringify(body),
    },
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return await res.json();
  });
}
