import "@testing-library/jest-dom";
import { ChainId } from "common/src/chain-ids";
import {
  ApplicationStatus,
  ProjectApplicationMetadata,
  RoundVisibilityType,
} from "data-layer";
import {
  ProjectsState,
  Status,
  initialState as initialProjectsState,
  projectsReducer,
} from "../../reducers/projects";
import { addressFrom } from "../../utils/test_utils";

// Note: these tests are only testing QuadraticFunding RoundCategory type
describe("projects reducer", () => {
  let state: ProjectsState;

  beforeEach(() => {
    state = initialProjectsState;
  });

  it("PROJECT_APPLICATIONS_LOADING updates state", async () => {
    const initialState: ProjectsState = {
      ...state,
      applications: {
        "1": [
          {
            id: "1",
            projectId: "1",
            chainId: 1,
            roundId: addressFrom(1),
            status: "PENDING" as ApplicationStatus,
            metadataCid: "0x1",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 1",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 1",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
        ],
        "2": [
          {
            id: "1",
            projectId: "1",
            chainId: 1,
            roundId: addressFrom(2),
            status: "PENDING" as ApplicationStatus,
            metadataCid: "0x1",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 2",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 2",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
        ],
      },
    };

    const newState: ProjectsState = projectsReducer(initialState, {
      type: "PROJECT_APPLICATIONS_LOADING",
      projectID: "2",
    });

    expect(newState.applications).toEqual({
      "1": [
        {
          roundId: addressFrom(1),
          status: "PENDING" as ApplicationStatus,
          chainId: 1,
          id: "1",
          projectId: "1",
          metadataCid: "0x1",
          metadata: {},
          distributionTransaction: null,
          anchorAddress: addressFrom(123) as `0x${string}`,
          round: {
            applicationsStartTime: "0",
            applicationsEndTime: "0",
            donationsStartTime: "0",
            donationsEndTime: "0",
            roundMetadata: {
              name: "Round 1",
              roundType: "public" as RoundVisibilityType,
              eligibility: {
                description: "Eligibility description",
                requirements: [{ requirement: "Requirement 1" }],
              },
              programContractAddress: "0x1",
              support: {
                info: "https://support.com",
                type: "WEBSITE",
              },
            },
            name: "Round 1",
            strategyName: "allov1.QF",
          },
          totalDonationsCount: 0,
          totalAmountDonatedInUsd: 0,
          uniqueDonorsCount: 0,
        },
      ],
    });
  });

  it("PROJECT_APPLICATIONS_LOADED updates state", async () => {
    const initialState: ProjectsState = {
      ...state,
      applications: {
        "1": [
          {
            roundId: addressFrom(1),
            status: "PENDING" as ApplicationStatus,
            chainId: 1,
            id: "1",
            projectId: "1",
            metadataCid: "0x1",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 1",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 1",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
        ],
      },
    };

    const newState: ProjectsState = projectsReducer(initialState, {
      type: "PROJECT_APPLICATIONS_LOADED",
      projectID: "2",
      applications: [
        {
          roundId: addressFrom(2),
          status: "APPROVED" as ApplicationStatus,
          chainId: 1,
          id: "2",
          projectId: "2",
          metadataCid: "0x2",
          metadata: {} as ProjectApplicationMetadata,
          distributionTransaction: null,
          anchorAddress: addressFrom(123) as `0x${string}`,
          round: {
            applicationsStartTime: "0",
            applicationsEndTime: "0",
            donationsStartTime: "0",
            donationsEndTime: "0",
            roundMetadata: {
              name: "Round 2",
              roundType: "public" as RoundVisibilityType,
              eligibility: {
                description: "Eligibility description",
                requirements: [{ requirement: "Requirement 1" }],
              },
              programContractAddress: "0x1",
              support: {
                info: "https://support.com",
                type: "WEBSITE",
              },
            },
            name: "Round 2",
            strategyName: "allov1.QF",
          },
          totalDonationsCount: 0,
          totalAmountDonatedInUsd: 0,
          uniqueDonorsCount: 0,
        },
      ],
    });

    expect(newState.applications).toEqual({
      "1": [
        {
          roundId: addressFrom(1),
          projectId: "1",
          status: "PENDING" as ApplicationStatus,
          chainId: 1,
          id: "1",
          metadataCid: "0x1",
          metadata: {} as ProjectApplicationMetadata,
          distributionTransaction: null,
          anchorAddress: addressFrom(123) as `0x${string}`,
          round: {
            applicationsStartTime: "0",
            applicationsEndTime: "0",
            donationsStartTime: "0",
            donationsEndTime: "0",
            roundMetadata: {
              name: "Round 1",
              roundType: "public" as RoundVisibilityType,
              eligibility: {
                description: "Eligibility description",
                requirements: [{ requirement: "Requirement 1" }],
              },
              programContractAddress: "0x1",
              support: {
                info: "https://support.com",
                type: "WEBSITE",
              },
            },
            name: "Round 1",
            strategyName: "allov1.QF",
          },
          totalDonationsCount: 0,
          totalAmountDonatedInUsd: 0,
          uniqueDonorsCount: 0,
        },
      ],
      "2": [
        {
          roundId: addressFrom(2),
          projectId: "2",
          status: "APPROVED" as ApplicationStatus,
          chainId: 1,
          id: "2",
          metadataCid: "0x2",
          metadata: {} as ProjectApplicationMetadata,
          distributionTransaction: null,
          anchorAddress: addressFrom(123) as `0x${string}`,
          round: {
            applicationsStartTime: "0",
            applicationsEndTime: "0",
            donationsStartTime: "0",
            donationsEndTime: "0",
            roundMetadata: {
              name: "Round 2",
              roundType: "public" as RoundVisibilityType,
              eligibility: {
                description: "Eligibility description",
                requirements: [{ requirement: "Requirement 1" }],
              },
              programContractAddress: "0x1",
              support: {
                info: "https://support.com",
                type: "WEBSITE",
              },
            },
            name: "Round 2",
            strategyName: "allov1.QF",
          },
          totalDonationsCount: 0,
          totalAmountDonatedInUsd: 0,
          uniqueDonorsCount: 0,
        },
      ],
    });
  });

  it("PROJECT_APPLICATIONS_ERROR updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_ERROR",
      projectID: "12345",
      error: "error",
    });

    expect(newState.error).toBe("error");
  });

  it("PROJECT_APPLICATION_UPDATED updates a project application status", async () => {
    const initialState: ProjectsState = {
      ...state,
      applications: {
        "1": [
          {
            roundId: "0x1",
            status: "PENDING" as ApplicationStatus,
            chainId: 1,
            id: "1",
            projectId: "1",
            metadataCid: "0x1",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 1",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 1",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
        ],
        "2": [
          {
            roundId: "0x1",
            status: "PENDING" as ApplicationStatus,
            chainId: 1,
            id: "1",
            projectId: "1",
            metadataCid: "0x1",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 1",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 1",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
          {
            roundId: "0x2",
            status: "PENDING" as ApplicationStatus,
            chainId: 1,
            id: "2",
            projectId: "2",
            metadataCid: "0x2",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 2",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 2",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
          {
            roundId: "0x3",
            status: "PENDING" as ApplicationStatus,
            chainId: 1,
            id: "3",
            projectId: "3",
            metadataCid: "0x3",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 3",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 3",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
          {
            roundId: "0x4",
            status: "PENDING" as ApplicationStatus,
            chainId: 1,
            id: "4",
            projectId: "4",
            metadataCid: "0x4",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 4",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 4",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
        ],
        "3": [
          {
            roundId: "0x3",
            status: "PENDING" as ApplicationStatus,
            chainId: 1,
            id: "1",
            projectId: "1",
            metadataCid: "0x1",
            metadata: {} as ProjectApplicationMetadata,
            distributionTransaction: null,
            anchorAddress: addressFrom(123) as `0x${string}`,
            round: {
              applicationsStartTime: "0",
              applicationsEndTime: "0",
              donationsStartTime: "0",
              donationsEndTime: "0",
              roundMetadata: {
                name: "Round 3",
                roundType: "public" as RoundVisibilityType,
                eligibility: {
                  description: "Eligibility description",
                  requirements: [{ requirement: "Requirement 1" }],
                },
                programContractAddress: "0x1",
                support: {
                  info: "https://support.com",
                  type: "WEBSITE",
                },
              },
              name: "Round 3",
              strategyName: "allov1.QF",
            },
            totalDonationsCount: 0,
            totalAmountDonatedInUsd: 0,
            uniqueDonorsCount: 0,
          },
        ],
      },
    };

    const newState: ProjectsState = projectsReducer(initialState, {
      type: "PROJECT_APPLICATION_UPDATED",
      projectID: "2",
      roundID: "0x3",
      status: "APPROVED",
    });

    expect(newState.applications!["2"][2]).toEqual({
      roundId: "0x3",
      projectId: "3",
      status: "APPROVED" as ApplicationStatus,
      chainId: 1,
      id: "3",
      metadataCid: "0x3",
      metadata: {},
      distributionTransaction: null,
      anchorAddress: addressFrom(123) as `0x${string}`,
      round: {
        applicationsStartTime: "0",
        applicationsEndTime: "0",
        donationsStartTime: "0",
        donationsEndTime: "0",
        roundMetadata: {
          name: "Round 3",
          roundType: "public" as RoundVisibilityType,
          eligibility: {
            description: "Eligibility description",
            requirements: [{ requirement: "Requirement 1" }],
          },
          programContractAddress: "0x1",
          support: {
            info: "https://support.com",
            type: "WEBSITE",
          },
        },
        name: "Round 3",
        strategyName: "allov1.QF",
      },
      totalDonationsCount: 0,
      totalAmountDonatedInUsd: 0,
      uniqueDonorsCount: 0,
    });
  });

  it("handles multiple chain loading states", async () => {
    const state1: ProjectsState = projectsReducer(state, {
      type: "PROJECTS_LOADING",
      payload: [10, 1],
    });

    expect(state1.status).toEqual(Status.Loading);
    expect(state1.loadingChains.length).toEqual(2);

    const state2: ProjectsState = projectsReducer(state1, {
      type: "PROJECTS_LOADED",
      payload: {
        chainIDs: [ChainId.OPTIMISM_MAINNET_CHAIN_ID, ChainId.MAINNET],
      },
    });

    expect(state2.status).toEqual(Status.Loaded);
    expect(state2.loadingChains.length).toEqual(0);
  });
});
