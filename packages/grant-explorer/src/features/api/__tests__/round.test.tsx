import { makeApprovedProjectData, makeRoundData } from "../../../test-utils";
import { ApplicationStatus, Round } from "../types";
import { fetchFromIPFS, graphql_fetch } from "../utils";
import { getRoundById, GetRoundByIdResult, getProjectOwners } from "../round";
import { Mock } from "vitest";

vi.mock("../utils", () => ({
  ...vi.importActual("../utils"),
  graphql_fetch: vi.fn(),
  fetchFromIPFS: vi.fn(),
}));

vi.mock("../round", async () => {
  const actual = await vi.importActual<typeof import("../round")>("../round");
  return {
    ...actual,
    getProjectOwners: vi.fn(),
  };
});

describe("getRoundById", () => {
  let expectedRoundData: Round;
  let expectedRound: Partial<Round>;
  let graphQLResult: GetRoundByIdResult;

  beforeEach(() => {
    vi.clearAllMocks();

    expectedRoundData = makeRoundData();
    expectedRound = {
      ...expectedRoundData,
    };
    delete expectedRound.store;
    delete expectedRound.applicationStore;

    graphQLResult = {
      data: {
        rounds: [
          {
            id: expectedRoundData.id!,
            program: {
              id: expectedRoundData.ownedBy,
            },
            roundMetaPtr: expectedRoundData.store!,
            applicationMetaPtr: expectedRoundData.applicationStore!,
            applicationsStartTime: convertDateToSecondsString(
              expectedRoundData.applicationsStartTime
            ),
            applicationsEndTime: convertDateToSecondsString(
              expectedRoundData.applicationsEndTime
            ),
            roundStartTime: convertDateToSecondsString(
              expectedRoundData.roundStartTime
            ),
            roundEndTime: convertDateToSecondsString(
              expectedRoundData.roundEndTime
            ),
            token: expectedRoundData.token,
            payoutStrategy: { 
              id: "some-id",
              strategyName: "MERKLE",
            },
            votingStrategy: expectedRoundData.votingStrategy,
            projectsMetaPtr: null,
            projects: [],
          },
        ],
      },
    };

    (graphql_fetch as Mock).mockResolvedValue(graphQLResult);
    (fetchFromIPFS as Mock).mockImplementation((pointer: string) => {
      if (pointer === expectedRoundData.store?.pointer) {
        return expectedRoundData.roundMetadata;
      }
      return {};
    });
  });

  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    const actualRound = await getRoundById(expectedRoundData.id!, "someChain");

    expect(actualRound).toMatchObject(expectedRound);
    expect(graphql_fetch as Mock).toBeCalledTimes(1);
    expect(fetchFromIPFS as Mock).toBeCalledTimes(1);
    expect(fetchFromIPFS as Mock).toBeCalledWith(
      expectedRoundData.store?.pointer
    );
  });

  describe("when round has approved projects", () => {
    const roundProjectStatuses = "round-project-metadata-ptr";
    const approvedProjectMetadataPointer = "my-project-metadata";
    const expectedApprovedApplication = makeApprovedProjectData();

    let graphQLResultWithApprovedApplication: GetRoundByIdResult;
    let graphQLResultWithProjectOwners: any;
    let roundMetadataIpfsResult: any;
    let roundProjectStatusesIpfsResult: any;

    beforeEach(() => {
      graphQLResultWithApprovedApplication = {
        data: {
          rounds: [
            {
              ...graphQLResult.data.rounds[0],
              projectsMetaPtr: { protocol: 1, pointer: roundProjectStatuses },
              projects: [
                {
                  id: expectedApprovedApplication.grantApplicationId,
                  project: expectedApprovedApplication.projectRegistryId,
                  metaPtr: {
                    protocol: 1,
                    pointer: approvedProjectMetadataPointer,
                  },
                  status: expectedApprovedApplication.status,
                  applicationIndex:
                    expectedApprovedApplication.applicationIndex,
                },
              ],
            },
          ],
        },
      };

      graphQLResultWithProjectOwners = {
        data: {
          projects: [
            {
              id: expectedApprovedApplication.projectRegistryId,
              accounts: [
                {
                  account: {
                    address: "0x4873178bea2dcd7022f0ef6c70048b0e05bf9017",
                  },
                },
              ],
            },
          ],
        },
      };

      roundMetadataIpfsResult = expectedRound.roundMetadata;
      roundProjectStatusesIpfsResult = [
        {
          id: expectedApprovedApplication.grantApplicationId,
          status: ApplicationStatus.APPROVED,
          payoutAddress: "some payout address",
        },
      ];

      const projectOwners =
        expectedApprovedApplication.projectMetadata.owners.map(
          (it) => it.address
        );

      (getProjectOwners as Mock).mockResolvedValue(projectOwners);
    });

    it("maps approved project metadata for old application format", async () => {
      const oldFormat = {
        round: expectedRound.id,
        project: {
          ...expectedApprovedApplication.projectMetadata,
        },
      };

      (graphql_fetch as Mock)
        .mockResolvedValueOnce(graphQLResultWithApprovedApplication)
        .mockResolvedValueOnce(graphQLResultWithProjectOwners);

      (fetchFromIPFS as Mock).mockImplementation((pointer: string) => {
        if (pointer === expectedRoundData.store?.pointer) {
          return roundMetadataIpfsResult;
        }
        if (pointer === roundProjectStatuses) {
          return roundProjectStatusesIpfsResult;
        }
        if (pointer === approvedProjectMetadataPointer) {
          return oldFormat;
        }
        return {};
      });

      const actualRound = await getRoundById(
        expectedRoundData.id!,
        "someChain"
      );

      expect(actualRound).toMatchObject(expectedRound);
    });
  });
});

const convertDateToSecondsString = (date: Date): string =>
  (date.valueOf() / 1000).toString();
