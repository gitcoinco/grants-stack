/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { faker } from "@faker-js/faker";
import { fireEvent, render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useSwitchNetwork, WagmiConfig } from "wagmi";
import {
  makeApprovedProjectData,
  makeMatchingStatsData,
  makeQFDistribution,
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithFinalizeRoundContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { useFetchMatchingDistributionFromContract } from "../../api/payoutStrategy/merklePayoutStrategy";
import { ProgressStatus } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";
import { useRound, useRoundMatchingFunds } from "../../../hooks";
import { Round } from "../../api/types";
import { client } from "../../../app/wagmi";
import { zeroAddress } from "viem";
import { fetchFinalizedMatches } from "../../api/round";

export const mockNetwork = {
  chain: { id: 5, name: "Goerli" },
  chains: [
    { id: 10, name: "Optimism" },
    { id: 5, name: "Goerli" },
  ],
};
let mockRoundData: Round = makeRoundData();

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  useNetwork: () => mockNetwork,
  useWalletClient: () => ({
    data: {
      getChainId: () => 5,
    },
  }),
  useDisconnect: jest.fn(),
  useSwitchNetwork: jest.fn(),
  useAccount: () => ({
    address: mockRoundData.operatorWallets
      ? mockRoundData.operatorWallets[0]
      : zeroAddress,
  }),
  usePublicClient: () => ({
    getChainId: () => 5,
  }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../../hooks", () => ({
  ...jest.requireActual("../../../hooks"),
  useRound: jest.fn(),
  useRoundMatchingFunds: jest.fn(() => ({
    data: [],
    error: null,
    loading: false,
    mutate: jest.fn(),
  })),
}));

jest.mock("../../api/round", () => ({
  ...jest.requireActual("../../api/round"),
  fetchFinalizedMatches: jest.fn(),
}));
//
// jest.mock("../../../context/application/ApplicationContext", () => ({
//   ...jest.requireActual("../../../context/application/ApplicationContext"),
//   useApplicationByRoundId: () => ({ applications: [] }),
// }));

jest.mock("../../api/payoutStrategy/merklePayoutStrategy", () => ({
  ...jest.requireActual("../../api/payoutStrategy/merklePayoutStrategy"),
  useFetchMatchingDistributionFromContract: jest.fn(),
}));

describe("View Round Results before distribution data is finalized to contract", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  describe("display round results tab", () => {
    it("displays matching stats table from api after round end date", async () => {
      (useRoundMatchingFunds as jest.Mock).mockImplementation(() => ({
        data: [makeQFDistribution(), makeQFDistribution()],
        error: null,
        loading: false,
        mutate: jest.fn(),
      }));

      (
        useFetchMatchingDistributionFromContract as jest.Mock
      ).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: [],
        isLoading: false,
        isError: null,
      }));

      const roundEndTime = faker.date.recent();
      const roundStartTime = faker.date.past({
        years: 1,
        refDate: roundEndTime,
      });
      const applicationsEndTime = faker.date.past({
        years: 1,
        refDate: roundStartTime,
      });
      const applicationsStartTime = faker.date.past({
        years: 1,
        refDate: applicationsEndTime,
      });

      (useRound as jest.Mock).mockReturnValue({
        data: {
          id: mockRoundData.id,
          applicationsStartTime,
          applicationsEndTime,
          roundEndTime,
          roundStartTime,
          amountUSD: 10,
          matchAmountUSD: 10,
          votes: 1,
          matchAmount: BigInt(10),
          uniqueContributors: 1,
          token: faker.finance.ethereumAddress(),
        },
        isLoading: false,
      });

      (fetchFinalizedMatches as jest.Mock).mockImplementation(async () => [
        {
          matches: [
            {
              revisedContributionCount: 0,
              revisedMatch: 0n,
              matched: 0n,
              contributionsCount: 0,
              projectId: "",
              applicationId: "",
              projectName: "",
              payoutAddress: "",
            },
          ],
          readyForPayoutTransactionHash: "",
        },
      ]);

      const approvedProjects = [
        makeApprovedProjectData(),
        makeApprovedProjectData(),
        makeApprovedProjectData(),
      ];

      mockRoundData = makeRoundData({
        applicationsStartTime,
        applicationsEndTime,
        roundStartTime,
        roundEndTime,
        approvedProjects,
      });

      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithApplicationContext(
            wrapWithReadProgramContext(
              wrapWithFinalizeRoundContext(
                wrapWithRoundContext(
                  <WagmiConfig config={client}>
                    <ViewRoundPage />
                  </WagmiConfig>,
                  {
                    data: [mockRoundData],
                    fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                  }
                )
              )
            )
          )
        )
      );
      const roundResultsTab = screen.getByTestId("round-results");
      fireEvent.click(roundResultsTab);
      expect(
        await screen.findByTestId("match-stats-title")
      ).toBeInTheDocument();

      expect(
        await screen.findByTestId("match-stats-table")
      ).toBeInTheDocument();
    });
  });

  describe("finalize state to contract", () => {
    beforeEach(() => {
      (useRoundMatchingFunds as jest.Mock).mockImplementation(() => ({
        data: [makeQFDistribution(), makeQFDistribution()],
        error: null,
        loading: false,
        mutate: jest.fn(),
      }));

      (
        useFetchMatchingDistributionFromContract as jest.Mock
      ).mockImplementation(() => ({
        distributionMetaPtr: "",
        matchingDistribution: [],
        isLoading: false,
        isError: null,
      }));

      const roundEndTime = faker.date.past();
      mockRoundData = makeRoundData({ roundEndTime });

      const roundStartTime = faker.date.past(1, roundEndTime);
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);

      (useRound as jest.Mock).mockReturnValue({
        data: {
          id: mockRoundData.id,
          applicationsStartTime,
          applicationsEndTime,
          roundEndTime,
          roundStartTime,
          amountUSD: 10,
          matchAmountUSD: 10,
          votes: 1,
          matchAmount: BigInt(10),
          uniqueContributors: 1,
          token: faker.finance.ethereumAddress(),
        },
        isLoading: false,
      });
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithFinalizeRoundContext(
            wrapWithApplicationContext(
              wrapWithReadProgramContext(
                wrapWithRoundContext(
                  <WagmiConfig config={client}>
                    <ViewRoundPage />
                  </WagmiConfig>,
                  {
                    data: [mockRoundData],
                    fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                  }
                ),
                { programs: [] }
              ),
              {
                applications: [],
                isLoading: false,
              }
            )
          )
        )
      );
    });
    it("displays the finalize button", async () => {
      const roundResultsTab = screen.getByTestId("round-results");

      fireEvent.click(roundResultsTab);
      expect(screen.getByTestId("finalize-results-button")).toBeInTheDocument();
    });
  });
});

describe("View Round Results after distribution data is finalized to contract", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});
  });

  it("displays finalized matching data from contract", async () => {
    (useRoundMatchingFunds as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
      mutate: jest.fn(),
    }));

    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(
      () => ({
        distributionMetaPtr: "abcd",
        matchingDistribution: [
          makeMatchingStatsData(),
          makeMatchingStatsData(),
        ],
        isLoading: false,
        isError: null,
      })
    );

    const roundEndTime = faker.date.recent();
    const roundStartTime = faker.date.past(1, roundEndTime);
    const applicationsEndTime = faker.date.past(1, roundStartTime);
    const applicationsStartTime = faker.date.past(1, applicationsEndTime);

    (useRoundMatchingFunds as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
      mutate: jest.fn(),
    }));

    (useRound as jest.Mock).mockReturnValue({
      data: {
        id: mockRoundData.id,
        applicationsStartTime,
        applicationsEndTime,
        roundEndTime,
        roundStartTime,
        amountUSD: 10,
        matchAmountUSD: 10,
        votes: 1,
        matchAmount: BigInt(10),
        uniqueContributors: 1,
        token: faker.finance.ethereumAddress(),
      },
      isLoading: false,
    });

    const approvedProjects = [
      makeApprovedProjectData(),
      makeApprovedProjectData(),
      makeApprovedProjectData(),
    ];
    mockRoundData = makeRoundData({
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      approvedProjects,
    });
    render(
      wrapWithBulkUpdateGrantApplicationContext(
        wrapWithApplicationContext(
          wrapWithReadProgramContext(
            wrapWithFinalizeRoundContext(
              wrapWithRoundContext(
                <WagmiConfig config={client}>
                  <ViewRoundPage />
                </WagmiConfig>,
                {
                  data: [mockRoundData],
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                }
              )
            )
          )
        )
      )
    );
    const roundResultsTab = screen.getByTestId("round-results");
    fireEvent.click(roundResultsTab);
    expect(screen.getByTestId("match-stats-title")).toBeInTheDocument();
    expect(screen.getByTestId("match-stats-table")).toBeInTheDocument();
  });
});
