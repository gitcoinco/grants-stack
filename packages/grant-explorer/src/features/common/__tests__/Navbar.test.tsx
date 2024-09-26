import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react";
import {
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import Navbar from "../Navbar";
import type rrd from "react-router-dom";
const userAddress = faker.finance.ethereumAddress();

const mockAccount = {
  address: userAddress,
  isConnected: false,
};

vi.mock("wagmi", async () => {
  const actual = await vi.importActual<typeof import("wagmi")>("wagmi");
  return {
    ...actual,
    useAccount: () => mockAccount,
    useBalance: () => mockBalance,
    useSigner: () => mockSigner,
    useNetwork: () => mockNetwork,
  };
});

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(),
}));

vi.mock("../Auth");

vi.mock("../PassportWidget", () => ({
  PassportWidget: vi.fn(),
}));

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const chainId = 5;
  const roundId = faker.finance.ethereumAddress();

  const useParamsFn = () => ({
    chainId,
    roundId,
  });

  const actual = await vi.importActual<typeof rrd>("react-router-dom");
  return {
    ...actual,
    useParams: useParamsFn,
    useNavigate: () => navigateMock,
  };
});

describe("<Navbar>", () => {
  it("SHOULD display home-link", () => {
    renderWithContext(<Navbar className="" />);
    expect(screen.getByTestId("navbar-logo")).toBeInTheDocument();
  });

  it("SHOULD display connect wallet button", () => {
    renderWithContext(<Navbar className="" />);
    expect(screen.getByTestId("connect-wallet-button")).toBeInTheDocument();
  });

  it("SHOULD display cart if round has not ended", () => {
    renderWithContext(<Navbar className="" />);
    expect(screen.getByTestId("navbar-cart")).toBeInTheDocument();
  });
});
