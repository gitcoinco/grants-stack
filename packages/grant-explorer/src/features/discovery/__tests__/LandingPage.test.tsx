import { faker } from "@faker-js/faker";
import { screen, waitFor } from "@testing-library/react";
import {
  makeRoundOverviewData,
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import LandingPage from "../LandingPage";
import { vi } from "vitest";
import { DataLayer } from "data-layer";
import { getEnabledChains } from "../../../app/chainConfig";

// Mock the API calls

// Create empty mock functions - we will set these inside the tests.
const { __deprecated_graphql_fetch, __deprecated_fetchFromIPFS } = vi.hoisted(
  () => ({
    __deprecated_graphql_fetch: vi.fn(),
    __deprecated_fetchFromIPFS: vi.fn(),
  })
);

vi.mock("common", async () => {
  const actual = await vi.importActual<typeof import("common")>("common");
  return {
    ...actual,
    renderToPlainText: vi.fn().mockReturnValue((str = "") => str),
  };
});

vi.mock("../../api/utils", async () => {
  const actual =
    await vi.importActual<typeof import("../../api/utils")>("../../api/utils");
  return {
    ...actual,
    __deprecated_graphql_fetch,
    __deprecated_fetchFromIPFS,
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
const mockToken = vi.fn();

vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

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
    __deprecated_graphql_fetch.mockReset();
    __deprecated_fetchFromIPFS.mockReset();
  });

  it("renders landing page", () => {
    renderWithContext(<LandingPage />);
  });

  it("fetches and displays active rounds and rounds in application phase", async () => {
    const mockedRounds = Array.from({ length: 1 }).map(() =>
      makeRoundOverviewData()
    );

    const mockDataLayer = {
      getRounds: vi.fn().mockResolvedValue({
        rounds: getEnabledChains().flatMap((chain) =>
          mockedRounds.map((round) => ({
            ...round,
            chainId: chain.id,
          }))
        ),
      }),
    } as unknown as DataLayer;

    // Return the same metadata that was created by the mock
    __deprecated_fetchFromIPFS.mockImplementation(async (cid: string) => {
      return mockedRounds.find((round) => round.roundMetadataCid === cid)
        ?.roundMetadata;
    });

    renderWithContext(<LandingPage />, { dataLayer: mockDataLayer });

    await waitFor(() => {
      // Check if the fetched active rounds are displayed
      mockedRounds.forEach((round) => {
        expect(
          screen.getByText(round.roundMetadata?.name ?? "")
        ).toBeInTheDocument();
      });
    });
  });
});
