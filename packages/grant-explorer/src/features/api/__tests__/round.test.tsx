import { makeApprovedProjectData, makeRoundData } from "../../../test-utils";
import { Round } from "../types";
import {
  __deprecated_fetchFromIPFS,
  __deprecated_graphql_fetch,
} from "../utils";
import {
  __deprecated_getProjectOwners,
  __deprecated_getRoundById,
  __deprecated_GetRoundByIdResult,
} from "../round";
import { Mock } from "vitest";

vi.mock("../utils", () => ({
  ...vi.importActual("../utils"),
  __deprecated_graphql_fetch: vi.fn(),
  __deprecated_fetchFromIPFS: vi.fn(),
}));

vi.mock("../round", async () => {
  const actual = await vi.importActual<typeof import("../round")>("../round");
  return {
    ...actual,
    __deprecated_getProjectOwners: vi.fn(),
  };
});

describe("getRoundById", () => {
  let expectedRoundData: Round;
  let expectedRound: Partial<Round>;
  let graphQLResult: __deprecated_GetRoundByIdResult;

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
              id: expectedRoundData.ownedBy!,
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
              strategyName: "allov1.QF",
            },
            votingStrategy: expectedRoundData.votingStrategy ?? "",
            projectsMetaPtr: null,
            projects: [],
          },
        ],
      },
    };

    (__deprecated_graphql_fetch as Mock).mockResolvedValue(graphQLResult);
    (__deprecated_fetchFromIPFS as Mock).mockImplementation(
      (pointer: string) => {
        if (pointer === expectedRoundData.store?.pointer) {
          return expectedRoundData.roundMetadata;
        }
        return {};
      }
    );
  });

  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    const actualRound = await __deprecated_getRoundById(
      expectedRoundData.id!,
      "someChain"
    );

    expect(actualRound).toMatchObject(expectedRound);
    expect(__deprecated_graphql_fetch as Mock).toBeCalledTimes(1);
    expect(__deprecated_fetchFromIPFS as Mock).toBeCalledTimes(1);
    expect(__deprecated_fetchFromIPFS as Mock).toBeCalledWith(
      expectedRoundData.store?.pointer
    );
  });

  describe("when round has approved projects", () => {
    const roundProjectStatuses = "round-project-metadata-ptr";
    const approvedProjectMetadataPointer = "my-project-metadata";
    const expectedApprovedApplication = makeApprovedProjectData();

    let graphQLResultWithApprovedApplication: __deprecated_GetRoundByIdResult;
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
          status: "APPROVED",
          payoutAddress: "some payout address",
        },
      ];

      const projectOwners =
        expectedApprovedApplication.projectMetadata.owners.map(
          (it) => it.address
        );

      (__deprecated_getProjectOwners as Mock).mockResolvedValue(projectOwners);
    });

    it("maps approved project metadata for old application format", async () => {
      const oldFormat = {
        round: expectedRound.id,
        project: {
          ...expectedApprovedApplication.projectMetadata,
        },
      };

      (__deprecated_graphql_fetch as Mock)
        .mockResolvedValueOnce(graphQLResultWithApprovedApplication)
        .mockResolvedValueOnce(graphQLResultWithProjectOwners);

      (__deprecated_fetchFromIPFS as Mock).mockImplementation(
        (pointer: string) => {
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
        }
      );

      const actualRound = await __deprecated_getRoundById(
        expectedRoundData.id!,
        "someChain"
      );

      expect(actualRound).toMatchObject(expectedRound);
    });
  });
});

const convertDateToSecondsString = (date: Date): string =>
  (date.valueOf() / 1000).toString();
