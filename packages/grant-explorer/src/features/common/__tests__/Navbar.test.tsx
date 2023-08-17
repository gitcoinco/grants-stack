import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react";
import {
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import Navbar from "../Navbar";

const userAddress = faker.finance.ethereumAddress();

const mockAccount = {
  address: userAddress,
  isConnected: false,
};

vi.mock("wagmi", async () => {
  const actual = await vi.importActual("wagmi");
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

vi.mock("react-router-dom", async () => {
  const chainId = 5;
  const roundId = faker.finance.ethereumAddress();

  const useParamsFn = () => ({
    chainId,
    roundId,
  });

  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: useParamsFn,
  };
});

describe("<Navbar>", () => {
  it("SHOULD display home-link", () => {
    renderWithContext(<Navbar customBackground="" />);
    expect(screen.getByTestId("home-link")).toBeInTheDocument();
  });

  it("SHOULD display connect wallet button", () => {
    renderWithContext(<Navbar customBackground="" />);
    expect(screen.getByTestId("connect-wallet-button")).toBeInTheDocument();
  });

  it("SHOULD display cart if round has not ended", () => {
    renderWithContext(<Navbar customBackground="" />);
    expect(screen.getByTestId("navbar-cart")).toBeInTheDocument();
  });
});
