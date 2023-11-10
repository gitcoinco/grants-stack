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
import { RoundOverview } from "../../api/rounds";
import LandingPage from "../LandingPage";
import { vi } from "vitest";
import { collections } from "../../collections/hooks/useCollections";
import { categories } from "../../categories/hooks/useCategories";

// Mock the API calls

// Create empty mock functions - we will set these inside the tests.
const { graphql_fetch, fetchFromIPFS } = vi.hoisted(() => ({
  graphql_fetch: vi.fn(),
  fetchFromIPFS: vi.fn(),
}));

vi.mock("common", async () => {
  const actual = await vi.importActual<typeof import("common")>("common");
  return {
    ...actual,
    renderToPlainText: vi.fn().mockReturnValue((str = "") => str),
    graphql_fetch,
  };
});

vi.mock("../../api/utils", async () => {
  const actual =
    await vi.importActual<typeof import("../../api/utils")>("../../api/utils");
  return { ...actual, fetchFromIPFS };
});

const chainId = faker.datatype.number();
const userAddress = faker.finance.ethereumAddress();
const mockAccount = {
  address: userAddress,
};
const mockSwitchNetwork = {
  chainId: chainId,
};
const mockToken = vi.fn();

vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

vi.mock("viem", async () => {
  const actual = await vi.importActual<typeof import("viem")>("viem");
  return {
    ...actual,
    getAddress: vi.fn().mockImplementation((addr) => addr),
  };
});
vi.mock("wagmi", async () => {
  const actual = await vi.importActual<typeof import("wagmi")>("wagmi");
  return {
    ...actual,
    useAccount: () => mockAccount,
    useToken: () => mockToken,
    useBalance: () => mockBalance,
    useSigner: () => mockSigner,
    useNetwork: () => mockNetwork,
    useSwitchNetwork: () => mockSwitchNetwork,
  };
});

describe("LandingPage", () => {
  beforeEach(() => {
    // Reset the mocks before each test
    graphql_fetch.mockReset();
    fetchFromIPFS.mockReset();
  });

  it("renders landing page", () => {
    renderWithContext(<LandingPage />);
  });

  it("fetches and displays active rounds and rounds in application phase", async () => {
    const mockedRounds = Array.from({ length: 1 }).map(() =>
      makeRoundOverviewData()
    );

    // Set the mock data
    graphql_fetch.mockResolvedValue({ data: { rounds: mockedRounds } });
    // Return the same metadata that was created by the mock
    fetchFromIPFS.mockImplementation(
      (cid: string) =>
        mockedRounds.find((round) => round.roundMetaPtr.pointer === cid)
          ?.roundMetadata
    );

    renderWithContext(<LandingPage />);

    await waitFor(() => {
      // Check if the fetched active rounds are displayed
      mockedRounds.forEach((round) => {
        expect(
          screen.getByText(round.roundMetadata?.name ?? "")
        ).toBeInTheDocument();
      });
    });
  });

  it("Renders Collections", async () => {
    renderWithContext(<LandingPage />);

    await waitFor(async () =>
      collections.forEach((collection) =>
        expect(screen.getByText(collection.name)).toBeInTheDocument()
      )
    );
  });

  it("Renders Categories", async () => {
    renderWithContext(<LandingPage />);

    await waitFor(async () =>
      categories.forEach((category) =>
        expect(screen.getByText(category.name)).toBeInTheDocument()
      )
    );
  });

  it.skip("filters active rounds based on search query", async () => {
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
