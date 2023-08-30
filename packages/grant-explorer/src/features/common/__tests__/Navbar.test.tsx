import { faker } from "@faker-js/faker";
import { fireEvent, screen } from "@testing-library/react";
import {
  mockBalance,
  mockNetwork,
  mockSigner,
  renderWithContext,
} from "../../../test-utils";
import Navbar from "../Navbar";
import type wagmi from "wagmi";
import type rrd from "react-router-dom";
const userAddress = faker.finance.ethereumAddress();

const mockAccount = {
  address: userAddress,
  isConnected: false,
};

vi.mock("wagmi", async () => {
  const actual = await vi.importActual<typeof wagmi>("wagmi");
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

  it("SHOULD navigate to the correct round URL when a round is clicked in RoundsSubNav", () => {
    renderWithContext(<Navbar customBackground="" />);

    const openSubnavButton = screen.getByLabelText("Open Grants Subnav");
    fireEvent.click(openSubnavButton);

    const link = screen.getByRole("link", {
      name: /climate solutions/i,
    });

    fireEvent.click(link);

    const expectedChainId = "10";
    const expectedRoundId = "0xb6be0ecafdb66dd848b0480db40056ff94a9465d";
    expect(navigateMock).toHaveBeenCalledWith(
      `/round/${expectedChainId}/${expectedRoundId}`
    );
  });
});
