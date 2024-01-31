import { makeGrantApplicationData } from "../../../test-utils";
import { getApplicationById, getApplicationsByRoundId } from "../application";
import { fetchFromIPFS } from "../utils";
import { GrantApplication } from "../types";
import { Contract } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { graphql_fetch } from "common";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  fetchFromIPFS: jest.fn(),
}));
jest.mock("common", () => ({
  ...jest.requireActual("common"),
  graphql_fetch: jest.fn(),
}));

jest.mock("ethers");

const signerOrProviderStub = {
  getNetwork: async () => Promise.resolve({ chainId: 5 }),
} as unknown as Web3Provider;

describe("getApplicationById", () => {
  let expectedApplication: GrantApplication;

  beforeEach(() => {
    expectedApplication = makeGrantApplicationData();
    const projectOwners = expectedApplication.project?.owners.map(
      (it) => it.address
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Contract as any).mockImplementation(() => {
      return {
        getProjectOwners: () => projectOwners,
      };
    });
  });

  it("should retrieve application data given an application id", async () => {
    console.log("expectedApplication", expectedApplication);
    const applicationId = expectedApplication.id;
    const expectedProjectsMetaPtr = expectedApplication.projectsMetaPtr;
    const expectedApplicationMetaPtr = {
      protocol: 1,
      pointer: "bafkreigfajf5ud3js6bmh3lwg5sp7cqyrqoy7e65y25myyqjywllxvcw2u",
    };
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        roundApplications: [
          {
            id: expectedApplication.id,
            metaPtr: expectedApplicationMetaPtr,
            status: "PENDING",
            applicationIndex: expectedApplication.applicationIndex,
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
            // return nothing
          },
        ];
      }
    });

    const actualApplication = await getApplicationById(
      applicationId,
      signerOrProviderStub
    );

    console.log("actualApplication", actualApplication);

    // Todo: need to be fixed to check whether if the entire application matches with expectedApplication
    expect(actualApplication.round).toEqual(expectedApplication.round);
  });

  it("throws an error when grant application doesn't exist", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {
        /* do nothing */
      });
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        roundApplications: [],
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

  it("should retrieve application data for a signed application", async () => {
    const applicationId = expectedApplication.id;
    const expectedProjectsMetaPtr = expectedApplication.projectsMetaPtr;
    const expectedApplicationMetaPtr = {
      protocol: 1,
      pointer: "bafkreigfajf5ud3js6bmh3lwg5sp7cqyrqoy7e65y25myyqjywllxvcw2u",
    };
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        roundApplications: [
          {
            id: expectedApplication.id,
            metaPtr: expectedApplicationMetaPtr,
            status: "PENDING",
            applicationIndex: expectedApplication.applicationIndex,
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
          signature: "someSignature",
          application: {
            round: expectedApplication.round,
            recipient: expectedApplication.recipient,
            project: expectedApplication.project,
            answers: expectedApplication.answers,
          },
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

    // Todo: need to be fixed to check whether if the entire application matches with expectedApplication
    expect(actualApplication.round).toEqual(expectedApplication.round);
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
        roundApplications: [
          {
            id: expectedApplication.id,
            metaPtr: expectedApplicationMetaPtr,
            status: "PENDING",
            applicationIndex: expectedApplication.applicationIndex,
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

    // Todo: need to be fixed to check whether if the entire application matches with expectedApplication
    expect(actualApplications[0].round).toEqual(expectedApplications[0].round);
  });

  it("should retrieve signed applications given an round id", async () => {
    const expectedApplication = expectedApplications[0];
    const roundId = expectedApplication.round;
    const expectedProjectsMetaPtr = expectedApplication.projectsMetaPtr;
    const expectedApplicationMetaPtr = {
      protocol: 1,
      pointer: "bafkreigfajf5ud3js6bmh3lwg5sp7cqyrqoy7e65y25myyqjywllxvcw2u",
    };
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        roundApplications: [
          {
            id: expectedApplication.id,
            metaPtr: expectedApplicationMetaPtr,
            status: "PENDING",
            applicationIndex: expectedApplication.applicationIndex,
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
          signature: "some-signature",
          application: {
            round: expectedApplication.round,
            recipient: expectedApplication.recipient,
            project: expectedApplication.project,
            answers: expectedApplication.answers,
          },
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

    // Todo: need to be fixed to check whether if the entire application matches with expectedApplication
    expect(actualApplications[0].round).toEqual(expectedApplications[0].round);
  });
});
