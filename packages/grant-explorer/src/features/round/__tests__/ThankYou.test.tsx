import {
  makeApprovedProjectData,
  makeRoundData,
  renderWithContext,
} from "../../../test-utils";
import { fireEvent, render, screen } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import ThankYou from "../ThankYou";
import { ChainId, getTxExplorer } from "../../api/utils";
import { RoundProvider } from "../../../context/RoundContext";
import { QFDonationProvider } from "../../../context/QFDonationContext";

const chainId = 5;
const roundId = faker.finance.ethereumAddress();
const txHash = faker.finance.ethereumAddress();

const useParamsFn = () => ({
  chainId: chainId,
  roundId: roundId,
  txHash: txHash,
});

const mockSigner = {
  data: {},
};

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
}));

describe("<ThankYou/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should show twitter, go back home, view your trasaction button", async () => {
    render(
      <RoundProvider>
        <ThankYou />
      </RoundProvider>
    );

    expect(await screen.queryByTestId("view-tx-button")).toBeInTheDocument();
    expect(await screen.queryByTestId("twitter-button")).toBeInTheDocument();
    expect(await screen.queryByTestId("home-button")).toBeInTheDocument();
  });
});
