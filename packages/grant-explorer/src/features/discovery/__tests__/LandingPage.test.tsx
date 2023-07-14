import { faker } from "@faker-js/faker";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  makeRoundOverviewData,
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import { RoundMetadata } from "../../api/round";
import {
  RoundOverview,
  getActiveRounds,
  getRoundsInApplicationPhase,
} from "../../api/rounds";
import LandingPage from "../LandingPage";

// Mock the API calls
jest.mock("../../api/rounds", () => {
  return {
    getActiveRounds: jest.fn(),
    getRoundsInApplicationPhase: jest.fn(),
  };
});

const chainId = faker.datatype.number();
const userAddress = faker.finance.ethereumAddress();
const mockAccount = {
  address: userAddress,
};
const mockSwitchNetwork = {
  chainId: chainId,
};

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
  useSwitchNetwork: () => mockSwitchNetwork,
}));

const mockGetActiveRounds = getActiveRounds as jest.MockedFunction<
  typeof getActiveRounds
>;
const mockGetRoundsInApplicationPhase =
  getRoundsInApplicationPhase as jest.MockedFunction<
    typeof getRoundsInApplicationPhase
  >;

describe("LandingPage", () => {
  beforeEach(() => {
    // Reset the mocks before each test
    mockGetActiveRounds.mockReset();
    mockGetRoundsInApplicationPhase.mockReset();
  });

  it("renders landing page", () => {
    renderWithContext(<LandingPage />);
  });

  it("fetches and displays active rounds and rounds in application phase", async () => {
    const activeRounds: RoundOverview[] = [];
    const roundsInApplicationPhase: RoundOverview[] = [
      // Provide your rounds in application phase data
    ];

    mockGetActiveRounds.mockImplementation(async () => {
      return new Promise((resolve) => {
        resolve({
          isLoading: false,
          error: null,
          rounds: activeRounds,
        });
      });
    });

    mockGetRoundsInApplicationPhase.mockImplementation(async () => {
      return new Promise((resolve) => {
        resolve({
          isLoading: false,
          error: null,
          rounds: roundsInApplicationPhase,
        });
      });
    });

    renderWithContext(<LandingPage />);

    await waitFor(() => {
      // Check if the fetched active rounds are displayed
      activeRounds.forEach((round) => {
        expect(
          screen.getByText(round.roundMetadata?.name ?? "")
        ).toBeInTheDocument();
      });

      // Check if the fetched rounds in application phase are displayed
      roundsInApplicationPhase.forEach((round) => {
        expect(
          screen.getByText(round.roundMetadata?.name ?? "")
        ).toBeInTheDocument();
      });
    });
  });

  it("filters active rounds based on search query", async () => {
    const roundMetadata: RoundMetadata = {
      name: "gitcoin",
      roundType: "private",
      eligibility: {
        description: faker.lorem.sentence(),
        requirements: [],
      },
      programContractAddress: faker.finance.ethereumAddress(),
    };

    const activeRounds: RoundOverview[] = [
      makeRoundOverviewData(),
      makeRoundOverviewData(),
      makeRoundOverviewData({ roundMetadata }),
      makeRoundOverviewData({
        roundMetadata: {
          ...roundMetadata,
          name: "gitcoin pro",
        },
      }),
    ];

    mockGetActiveRounds.mockImplementation(async () => {
      return new Promise((resolve) => {
        resolve({
          isLoading: false,
          error: null,
          rounds: activeRounds,
        });
      });
    });

    renderWithContext(<LandingPage />);

    await waitFor(async () => {
      // Make sure all active rounds are displayed initially
      activeRounds.forEach((round) => {
        expect(
          screen.getByText(round.roundMetadata?.name ?? "")
        ).toBeInTheDocument();
      });
    });

    const searchInput = screen.getByPlaceholderText("Search...");
    const roundCards = screen.getAllByTestId("round-card");
    expect(roundCards.length).toEqual(activeRounds.length);

    const searchQuery = "gitcoin";
    fireEvent.change(searchInput, { target: { value: searchQuery } });

    await waitFor(() => {
      const filteredRoundCards = screen.getAllByTestId("round-name");
      expect(filteredRoundCards.length).toEqual(2);
      expect(filteredRoundCards[0].textContent).toEqual(searchQuery);
    });
  });
});
