/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { faker } from "@faker-js/faker";
import { fireEvent, render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useSwitchNetwork } from "wagmi";
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
import { ProgressStatus, Round } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";
import { useRoundMatchingFunds } from "../../../hooks";

jest.mock("../../common/Auth");
jest.mock("../../api/round");
jest.mock("wagmi");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

let mockRoundData: Round = makeRoundData();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../../hooks", () => ({
  ...jest.requireActual("../../../hooks"),
  useRoundMatchingFunds: jest.fn(),
}));

jest.mock("../../api/payoutStrategy/merklePayoutStrategy", () => ({
  ...jest.requireActual("../../api/payoutStrategy/merklePayoutStrategy"),
  useFetchMatchingDistributionFromContract: jest.fn(),
}));

jest.mock("../../../context/round/FinalizeRoundContext", () => ({
  ...jest.requireActual("../../../context/round/FinalizeRoundContext"),
}));

jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    chain: {
      name: "Ethereum",
    },
    address: mockRoundData.operatorWallets![0],
    signer: {
      getChainId: () => {
        /* do nothing */
      },
    },
    provider: { getNetwork: () => ({ chainId: "0" }) },
  }),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
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
      const roundStartTime = faker.date.past(1, roundEndTime);
      const applicationsEndTime = faker.date.past(1, roundStartTime);
      const applicationsStartTime = faker.date.past(1, applicationsEndTime);

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
                wrapWithRoundContext(<ViewRoundPage />, {
                  data: [mockRoundData],
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                })
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

  describe("finalize state to contract", () => {
    beforeEach(() => {
      (useRoundMatchingFunds as jest.Mock).mockImplementation(() => ({
        data: [makeQFDistribution(), makeQFDistribution()],
        error: null,
        loading: false,
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
      render(
        wrapWithBulkUpdateGrantApplicationContext(
          wrapWithFinalizeRoundContext(
            wrapWithApplicationContext(
              wrapWithReadProgramContext(
                wrapWithRoundContext(<ViewRoundPage />, {
                  data: [mockRoundData],
                  fetchRoundStatus: ProgressStatus.IS_SUCCESS,
                }),
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
      expect(
        screen.getByRole("button", {
          name: /Finalize Results/i,
        })
      ).toBeInTheDocument();
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
              wrapWithRoundContext(<ViewRoundPage />, {
                data: [mockRoundData],
                fetchRoundStatus: ProgressStatus.IS_SUCCESS,
              })
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
