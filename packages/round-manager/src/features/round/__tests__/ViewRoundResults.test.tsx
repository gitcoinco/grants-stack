/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { faker } from "@faker-js/faker";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useParams } from "react-router-dom";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import {
  makeApprovedProjectData,
  makeQFDistribution,
  makeRoundData,
  wrapWithApplicationContext,
  wrapWithBulkUpdateGrantApplicationContext,
  wrapWithFinalizeRoundContext,
  wrapWithReadProgramContext,
  wrapWithRoundContext,
} from "../../../test-utils";
import { useFetchMatchingDistributionFromContract } from "../../api/payoutStrategy/payoutStrategy";
import { ProgressStatus } from "../../api/types";
import ViewRoundPage from "../ViewRoundPage";
import { useRound, useRoundMatchingFunds } from "../../../hooks";
import { Round } from "../../api/types";

jest.mock("../../common/Auth");
jest.mock("../../api/round");

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

const mockNetwork = {
  chain: { id: 10, name: "Optimism" },
  chains: [{ id: 10, name: "Optimism" }],
};
const mockSigner = {
  getChainId: () => {
    /* do nothing.*/
  },
};
jest.mock("wagmi", () => ({
  useNetwork: () => mockNetwork,
  useSigner: () => ({ data: mockSigner }),
  useDisconnect: jest.fn(),
  useSwitchNetwork: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

let mockRoundData: Round = makeRoundData();

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

jest.mock("../../api/payoutStrategy/payoutStrategy", () => ({
  ...jest.requireActual("../../api/payoutStrategy/payoutStrategy"),
  useFetchMatchingDistributionFromContract: jest.fn(),
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
    provider: {
      network: {
        chainId: 1,
      },
    },
  }),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

describe("View Round Results", () => {
  beforeEach(() => {
    (useParams as jest.Mock).mockImplementation(() => {
      return {
        id: mockRoundData.id,
      };
    });

    (useSwitchNetwork as jest.Mock).mockReturnValue({ chains: [] });
    (useDisconnect as jest.Mock).mockReturnValue({});

    (useRoundMatchingFunds as jest.Mock).mockImplementation(() => ({
      data: [makeQFDistribution(), makeQFDistribution()],
      error: null,
      loading: false,
      mutate: jest.fn(),
    }));

    const roundEndTime = faker.date.recent();
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
  });

  it("View Round Results before distribution data is finalized to contract", async () => {
    (useFetchMatchingDistributionFromContract as jest.Mock).mockImplementation(
      () => ({
        distributionMetaPtr: "",
        matchingDistribution: [],
        isLoading: false,
        isError: null,
      })
    );

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
    act(async () => {
      const roundResultsTab = await screen.getByTestId("round-results");
      fireEvent.click(roundResultsTab);
      const matchStatsTitle = await screen.findByTestId("match-stats-title");
      expect(matchStatsTitle).toBeInTheDocument();
      const matchStatsTable = await screen.findByTestId("match-stats-table");
      expect(matchStatsTable).toBeInTheDocument();
      const finalizeResultsButton = await screen.findByTestId(
        "finalize-results-button"
      );
      expect(finalizeResultsButton).toBeInTheDocument();
    });
  });
});
