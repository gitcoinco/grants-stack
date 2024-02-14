import "@testing-library/jest-dom";
import { ApplicationStatus, RoundVisibilityType } from "data-layer";
import {
  ProjectsState,
  Status,
  initialState as initialProjectsState,
  projectsReducer,
} from "../../reducers/projects";
import { addressFrom } from "../../utils/test_utils";

describe("projects reducer", () => {
  let state: ProjectsState;

  beforeEach(() => {
    state = initialProjectsState;
  });

  it("PROJECT_APPLICATIONS_LOADING updates state", async () => {
    const initialState = {
      ...state,
      applications: {
        "1": [
          {
            id: "1",
            chainId: 1,
            roundId: addressFrom(1),
            status: "PENDING" as ApplicationStatus,
            metadataCid: "0x1",
            metadata: {},
            inReview: false,
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
            },
          },
        ],
        "2": [
          {
            id: "1",
            chainId: 1,
            roundId: addressFrom(2),
            status: "PENDING" as ApplicationStatus,
            metadataCid: "0x1",
            metadata: {},
            inReview: false,
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
            },
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
          inReview: false,
          chainId: 1,
          id: "1",
          metadataCid: "0x1",
          metadata: {},
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
          },
        },
      ],
    });
  });

  it("PROJECT_APPLICATIONS_LOADED updates state", async () => {
    const initialState = {
      ...state,
      applications: {
        "1": [
          {
            roundId: addressFrom(1),
            status: "PENDING" as ApplicationStatus,
            inReview: false,
            chainId: 1,
            id: "1",
            metadataCid: "0x1",
            metadata: {},
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
            },
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
          inReview: false,
          chainId: 1,
          id: "2",
          metadataCid: "0x2",
          metadata: {},
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
          },
        },
      ],
    });

    expect(newState.applications).toEqual({
      "1": [
        {
          roundId: addressFrom(1),
          status: "PENDING" as ApplicationStatus,
          inReview: false,
          chainId: 1,
          id: "1",
          metadataCid: "0x1",
          metadata: {},
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
          },
        },
      ],
      "2": [
        {
          roundId: addressFrom(2),
          status: "APPROVED" as ApplicationStatus,
          inReview: false,
          chainId: 1,
          id: "2",
          metadataCid: "0x2",
          metadata: {},
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
          },
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
    const initialState = {
      ...state,
      applications: {
        "1": [
          {
            roundId: "0x1",
            status: "PENDING" as ApplicationStatus,
            inReview: false,
            chainId: 1,
            id: "1",
            metadataCid: "0x1",
            metadata: {},
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
            },
          },
        ],
        "2": [
          {
            roundId: "0x1",
            status: "PENDING" as ApplicationStatus,
            inReview: false,
            chainId: 1,
            id: "1",
            metadataCid: "0x1",
            metadata: {},
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
            },
          },
          {
            roundId: "0x2",
            status: "PENDING" as ApplicationStatus,
            inReview: false,
            chainId: 1,
            id: "2",
            metadataCid: "0x2",
            metadata: {},
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
            },
          },
          {
            roundId: "0x3",
            status: "PENDING" as ApplicationStatus,
            inReview: false,
            chainId: 1,
            id: "3",
            metadataCid: "0x3",
            metadata: {},
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
            },
          },
          {
            roundId: "0x4",
            status: "PENDING" as ApplicationStatus,
            inReview: false,
            chainId: 1,
            id: "4",
            metadataCid: "0x4",
            metadata: {},
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
            },
          },
        ],
        "3": [
          {
            roundId: "0x3",
            status: "PENDING" as ApplicationStatus,
            inReview: false,
            chainId: 1,
            id: "1",
            metadataCid: "0x1",
            metadata: {},
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
            },
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
      status: "APPROVED" as ApplicationStatus,
      inReview: false,
      chainId: 1,
      id: "3",
      metadataCid: "0x3",
      metadata: {},
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
      },
    });
  });

  it("handles multiple chain loading states", async () => {
    // start loading chain 0
    const state1: ProjectsState = projectsReducer(state, {
      type: "PROJECTS_LOADING",
      payload: 10,
    });

    expect(state1.status).toEqual(Status.Loading);
    expect(state1.loadingChains.length).toEqual(1);

    // start loading chain 1
    const state2: ProjectsState = projectsReducer(state1, {
      type: "PROJECTS_LOADING",
      payload: 1,
    });

    expect(state2.status).toEqual(Status.Loading);
    expect(state2.loadingChains.length).toEqual(2);

    // mark chain 1 as done
    const state3: ProjectsState = projectsReducer(state2, {
      type: "PROJECTS_LOADED",
      payload: {
        chainID: 1,
        events: {},
      },
    });

    expect(state3.status).toEqual(Status.Loading);
    expect(state3.loadingChains.length).toEqual(1);

    // mark chain 0 as done
    const state4: ProjectsState = projectsReducer(state3, {
      type: "PROJECTS_LOADED",
      payload: {
        chainID: 10,
        events: {},
      },
    });

    expect(state4.status).toEqual(Status.Loaded);
    expect(state4.loadingChains.length).toEqual(0);
  });
});
