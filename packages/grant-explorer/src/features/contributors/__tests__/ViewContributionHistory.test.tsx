import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import {
  ViewContributionHistory,
  ViewContributionHistoryWithoutDonations,
} from "../ViewContributionHistory";
import { MemoryRouter } from "react-router-dom";
import { BreadcrumbItem } from "../../common/Breadcrumb";
import { zeroAddress } from "viem";

import { VotingToken } from "common";
import { Contribution } from "data-layer";

const mockAddress = faker.finance.ethereumAddress();

const mockTokens: Record<string, VotingToken> = {
  ETH: {
    name: "Ethereum",
    chainId: 1,
    address: "0x0000000000000000000000000000000000000000",
    decimal: 18,
    logo: "https://example.com/eth_logo.png",
    default: true,
    redstoneTokenId: "abc123",
    defaultForVoting: true,
    canVote: true,
  },
  DAI: {
    name: "Dai",
    chainId: 1,
    address: "0x123456789abcdef",
    decimal: 18,
    defaultForVoting: true,
    canVote: true,
    redstoneTokenId: "DAI",
  },
};

const mockContributions: Contribution[] = [
  {
    id: "1",
    chainId: 1,
    projectId: "project1",
    roundId: "round1",
    recipientAddress: "recipient1",
    applicationId: "0",
    tokenAddress: "ETH",
    donorAddress: "voter1",
    amount: "10",
    amountInUsd: 100,
    transactionHash: "transaction1",
    blockNumber: 12345,
    round: {
      roundMetadata: {
        name: "Round 1",
        roundType: "public",
        eligibility: {
          description: "Eligibility description",
          requirements: [{ requirement: "Requirement 1" }],
        },
        programContractAddress: "0x1",
      },
      donationsStartTime: faker.date.past().toISOString(),
      donationsEndTime: faker.date.future().toISOString(),
    },
    application: {
      project: {
        name: "Project 1",
      },
    },
    timestamp: BigInt(0),
  },
  {
    id: "2",
    chainId: 1,
    projectId: "project2",
    roundId: "round1",
    recipientAddress: "recipient2",
    applicationId: "1",
    tokenAddress: "ETH",
    donorAddress: "voter2",
    amount: "20",
    amountInUsd: 200,
    transactionHash: "transaction2",
    blockNumber: 12346,
    round: {
      roundMetadata: {
        name: "Round 2",
        roundType: "public",
        eligibility: {
          description: "Eligibility description",
          requirements: [{ requirement: "Requirement 1" }],
        },
        programContractAddress: "0x1",
      },
      donationsStartTime: faker.date.past().toISOString(),
      donationsEndTime: faker.date.past().toISOString(),
    },
    application: {
      project: {
        name: "Project 2",
      },
    },
    timestamp: BigInt(0),
  },
];

const breadCrumbs = [
  {
    name: "Explorer Home",
    path: "/",
  },
  {
    name: "Contributors",
    path: `/contributors/${mockAddress}`,
  },
] as BreadcrumbItem[];

Object.defineProperty(window, "scrollTo", { value: () => {}, writable: true });

vi.mock("../../common/Navbar");
vi.mock("../../common/Auth");

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );

  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ address: zeroAddress }),
  };
});

vi.mock("wagmi", async () => {
  const actual = await vi.importActual<typeof import("wagmi")>("wagmi");
  return {
    ...actual,
    useSigner: () => ({
      data: {},
    }),
    useEnsName: vi.fn().mockReturnValue({ data: "" }),
    useAccount: vi.fn().mockReturnValue({ data: "mockedAccount" }),
  };
});

Object.assign(navigator, {
  clipboard: { writeText: vi.fn() },
});

describe("<ViewContributionHistory/>", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should show donation impact & donation history", async () => {
    render(
      <MemoryRouter>
        <ViewContributionHistory
          tokens={mockTokens}
          contributions={{ chainIds: [1], data: mockContributions }}
          address={mockAddress}
          addressLogo="mockedAddressLogo"
          breadCrumbs={breadCrumbs}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Donation Impact")).toBeInTheDocument();
    expect(screen.getByText("Donation History")).toBeInTheDocument();
    expect(screen.getByText("Active Rounds")).toBeInTheDocument();
    expect(screen.getByText("Past Rounds")).toBeInTheDocument();
    expect(
      screen.getByText(mockAddress.slice(0, 6) + "..." + mockAddress.slice(-6))
    ).toBeInTheDocument();
    expect(screen.getByText("Share Profile")).toBeInTheDocument();

    for (const contribution of mockContributions) {
        expect(
          screen.getByText(contribution.round.roundMetadata.name)
        ).toBeInTheDocument();
        expect(
          screen.getByText(contribution.application.project.name)
        ).toBeInTheDocument();
        expect(screen.getAllByText("View").length).toBeGreaterThan(
          0
        );
      
    }
  });
});

describe("<ViewContributionHistoryWithoutDonations/>", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should show donation history", async () => {
    render(
      <MemoryRouter>
        <ViewContributionHistoryWithoutDonations
          address={mockAddress}
          addressLogo="mockedAddressLogo"
          breadCrumbs={breadCrumbs}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Donation History")).toBeInTheDocument();
    });
    expect(
      screen.getByText(mockAddress.slice(0, 6) + "..." + mockAddress.slice(-6))
    ).toBeInTheDocument();
    expect(screen.getByText("Share Profile")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Share Profile"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringMatching("http://localhost:3000/#/contributors/")
    );
  });
});
