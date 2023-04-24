import { screen, waitFor } from "@testing-library/react";
import { renderWithContext } from "../../../test-utils";
import { RoundOverview, getActiveRounds, getRoundsInApplicationPhase } from "../../api/rounds";
import LandingPage from "../LandingPage";

// Mock the API calls
jest.mock("../../api/rounds", () => {
  return {
    getActiveRounds: jest.fn(),
    getRoundsInApplicationPhase: jest.fn(),
  };
});

const mockGetActiveRounds = getActiveRounds as jest.MockedFunction<typeof getActiveRounds>;
const mockGetRoundsInApplicationPhase = getRoundsInApplicationPhase as jest.MockedFunction<typeof getRoundsInApplicationPhase>;

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
    const activeRounds: RoundOverview[] = [

    ];
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
        expect(screen.getByText(round.roundMetadata?.name ?? "")).toBeInTheDocument();
      });

      // Check if the fetched rounds in application phase are displayed
      roundsInApplicationPhase.forEach((round) => {
        expect(screen.getByText(round.roundMetadata?.name ?? "")).toBeInTheDocument();
      });
    });
  });

  // todo: finish this test for the search functionality
  it("filters active rounds based on search query", async () => {
    const activeRounds: RoundOverview[] = [
      // Provide your active rounds data
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
        expect(screen.getByText(round.roundMetadata?.name ?? "")).toBeInTheDocument();
      });
    });

    // Enter a search query
    // const searchInput = screen.getByPlaceholderText("Search...");
    // await act(async () => {
    //   userEvent.type(searchInput, "search query");
    // });

    // Verify that the filtered active rounds are displayed
    // ...
  });
});

