import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react";
import {
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import Navbar from "../Navbar";

const chainId = 5;
const roundId = faker.finance.ethereumAddress();

const useParamsFn = () => ({
  chainId,
  roundId,
});

const userAddress = faker.finance.ethereumAddress();

const mockAccount = {
  address: userAddress,
  isConnected: false,
};

jest.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
}));

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../Auth");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: useParamsFn,
}));

describe("<Navbar>", () => {
  it("SHOULD display home-link", () => {
    renderWithContext(<Navbar customBackground="" roundUrlPath={"/random"} />);
    expect(screen.getByTestId("home-link")).toBeInTheDocument();
  });

  it("SHOULD display connect wallet button", () => {
    renderWithContext(<Navbar customBackground="" roundUrlPath={"/random"} />);
    expect(screen.getByTestId("connect-wallet-button")).toBeInTheDocument();
  });

  it("SHOULD display cart", () => {
    renderWithContext(<Navbar customBackground="" roundUrlPath={"/random"} />);
    expect(screen.getByTestId("navbar-cart")).toBeInTheDocument();
  });

  it("SHOULD display support options", async () => {
    renderWithContext(<Navbar customBackground="" roundUrlPath={"/random"} />);

    expect(screen.getByTestId("customer-support")).toBeInTheDocument();
  });
});
