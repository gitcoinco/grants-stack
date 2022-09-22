import { makeGrantApplicationData } from "../../../test-utils";
import { getApplicationById, getApplicationsByRoundId } from "../application";
import { fetchFromIPFS, graphql_fetch } from "../utils";
import { GrantApplication } from "../types";
import { Contract } from "ethers";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  graphql_fetch: jest.fn(),
  fetchFromIPFS: jest.fn(),
}));

jest.mock("ethers");

const signerOrProviderStub = {
  getNetwork: async () => Promise.resolve({ chainId: "chain" }),
};

describe("getApplicationById", () => {
  let expectedApplication: GrantApplication;

  beforeEach(() => {
    expectedApplication = makeGrantApplicationData();
    const projectOwners = expectedApplication.project?.owners.map(
      (it) => it.address
    );

    (Contract as any).mockImplementation(() => {
      return {
        getProjectOwners: () => projectOwners,
      };
    });
  });

  it("should retrieve application data given an application id", async () => {
    const applicationId = expectedApplication.id;
    const expectedProjectsMetaPtr = expectedApplication.projectsMetaPtr;
    const expectedApplicationMetaPtr = {
      protocol: 1,
      pointer: "bafkreigfajf5ud3js6bmh3lwg5sp7cqyrqoy7e65y25myyqjywllxvcw2u",
    };
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        roundProjects: [
          {
            id: expectedApplication.id,
            metaPtr: expectedApplicationMetaPtr,
            status: "PENDING",
            round: {
              projectsMetaPtr: expectedProjectsMetaPtr,
            },
          },
        ],
      },
    });

    (fetchFromIPFS as jest.Mock).mockImplementation((metaptr: string) => {
      if (metaptr === expectedApplicationMetaPtr.pointer) {
        return {
          round: expectedApplication.round,
          recipient: expectedApplication.recipient,
          project: expectedApplication.project,
          answers: expectedApplication.answers,
        };
      }
      if (metaptr === expectedProjectsMetaPtr.pointer) {
        return [
          {
            id: expectedApplication.id,
            status: expectedApplication.status,
          },
        ];
      }
    });

    const actualApplication = await getApplicationById(
      applicationId,
      signerOrProviderStub
    );

    expect(actualApplication).toEqual(expectedApplication);
  });

  it("throws an error when grant application doesn't exist", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        roundProjects: [],
      },
    });

    const getApplicationByIdPromise = getApplicationById(
      "any-id",
      signerOrProviderStub
    );

    await expect(getApplicationByIdPromise).rejects.toThrow(
      "Grant Application doesn't exist"
    );

    consoleErrorSpy.mockClear();
  });
});

describe("getApplicationsByRoundId", () => {
  let expectedApplications: GrantApplication[];

  beforeEach(() => {
    expectedApplications = [makeGrantApplicationData()];
  });

  it("should retrieve applications given an round id", async () => {
    const expectedApplication = expectedApplications[0];
    const roundId = expectedApplication.round;
    const expectedProjectsMetaPtr = expectedApplication.projectsMetaPtr;
    const expectedApplicationMetaPtr = {
      protocol: 1,
      pointer: "bafkreigfajf5ud3js6bmh3lwg5sp7cqyrqoy7e65y25myyqjywllxvcw2u",
    };
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        roundProjects: [
          {
            id: expectedApplication.id,
            metaPtr: expectedApplicationMetaPtr,
            status: "PENDING",
            round: {
              projectsMetaPtr: expectedProjectsMetaPtr,
            },
          },
        ],
      },
    });

    (fetchFromIPFS as jest.Mock).mockImplementation((metaptr: string) => {
      if (metaptr === expectedApplicationMetaPtr.pointer) {
        return {
          round: expectedApplication.round,
          recipient: expectedApplication.recipient,
          project: expectedApplication.project,
          answers: expectedApplication.answers,
        };
      }
      if (metaptr === expectedProjectsMetaPtr.pointer) {
        return [
          {
            id: expectedApplication.id,
            status: expectedApplication.status,
          },
        ];
      }
    });

    const actualApplications = await getApplicationsByRoundId(
      roundId,
      signerOrProviderStub
    );

    expect(actualApplications).toEqual(expectedApplications);
  });
});
