import { render, screen, waitFor } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import {
  ViewContributionHistory,
  ViewContributionHistoryWithoutDonations,
} from "../ViewContributionHistory";
import { mockSigner } from "../../../test-utils";
import { MemoryRouter } from "react-router-dom";
import { BreadcrumbItem } from "../../common/Breadcrumb";

const mockAddress = faker.finance.ethereumAddress();

const mockTokens = {
  ETH: {
    name: "Ethereum",
    chainId: 1,
    address: "0x0000000000000000000000000000000000000000",
    decimal: 18,
    logo: "https://example.com/eth_logo.png",
    default: true,
    redstoneTokenId: "abc123",
  },
  DAI: {
    name: "Dai",
    chainId: 1,
    address: "0x123456789abcdef",
    decimal: 18,
  },
};

const mockContributions = [
  {
    chainId: 1,
    data: [
      {
        id: "1",
        projectId: "project1",
        roundId: "round1",
        applicationId: "0",
        token: "ETH",
        voter: "voter1",
        grantAddress: faker.finance.ethereumAddress(),
        amount: "10",
        amountUSD: 100,
        transaction: "transaction1",
        roundName: "Round 1",
        projectTitle: "Project 1",
        roundStartTime: Number(faker.date.past()),
        roundEndTime: Number(faker.date.future()),
      },
      {
        id: "2",
        projectId: "project2",
        roundId: "round1",
        applicationId: "1",
        token: "ETH",
        voter: "voter2",
        grantAddress: faker.finance.ethereumAddress(),
        amount: "20",
        amountUSD: 200,
        transaction: "transaction2",
        roundName: "Round 2",
        projectTitle: "Project 2",
        roundStartTime: Number(faker.date.past()),
        roundEndTime: Number(faker.date.past()),
      },
    ],
  },
  {
    chainId: 10,
    data: [],
  },
];

const useParamsFn = () => ({
  address: mockAddress,
});

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

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useParams: useParamsFn,
}));
jest.mock("wagmi", () => ({
  useSigner: () => mockSigner,
  useEnsName: jest.fn().mockReturnValue({ data: "" }),
  useAccount: jest.fn().mockReturnValue({ data: "mockedAccount" }),
}));

describe("<ViewContributionHistory/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should show donation impact & donation history", async () => {
    render(
      <MemoryRouter>
        <ViewContributionHistory
          tokens={mockTokens}
          contributions={mockContributions}
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
      for (const chainContribution of contribution.data) {
        expect(
          screen.getByText(chainContribution.roundName)
        ).toBeInTheDocument();
        expect(
          screen.getByText(chainContribution.projectTitle)
        ).toBeInTheDocument();
        expect(screen.getAllByText("View transaction").length).toBeGreaterThan(
          0
        );
      }
    }
  });
});

describe("<ViewContributionHistoryWithoutDonations/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });
});
