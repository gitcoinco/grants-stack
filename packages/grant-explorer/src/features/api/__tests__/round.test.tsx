import { makeApprovedProjectData, makeRoundData } from "../../../test-utils";
import { Round } from "../types";
import {
  __deprecated_fetchFromIPFS,
  __deprecated_graphql_fetch,
} from "../utils";
import {
  __deprecated_getProjectOwners,
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
});

const convertDateToSecondsString = (date: Date): string =>
  (date.valueOf() / 1000).toString();
