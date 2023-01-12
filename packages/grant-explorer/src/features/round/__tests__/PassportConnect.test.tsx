import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import PassportConnect from "../PassportConnect";
import { BrowserRouter } from "react-router-dom";
import { fetchPassport, submitPassport } from "../../api/passport";
import { mockBalance, mockNetwork, mockSigner } from "../../../test-utils";

const chainId = 5;
const roundId = faker.finance.ethereumAddress();

jest.mock("../../../features/api/passport");
jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

const useParamsFn = () => ({
  chainId: chainId,
  roundId: roundId,
});
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useParams: useParamsFn,
}));

const userAddress = faker.finance.ethereumAddress();
const mockAccount = {
  address: userAddress,
  isConnected: true,
};

const mockJsonPromise = Promise.resolve({
  score: "1",
  address: userAddress,
});

const mockPassportPromise = {
  ok: true,
  json: () => mockJsonPromise
} as unknown as Response;

jest.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
}));

process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID = '12';

describe("<PassportConnect/>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Passport State", () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("IF passport state is match inelgible THEN it shows ineligible for matching", async () => {
      const mockJsonPromise = Promise.resolve({
        score: "-1",
        address: userAddress,
      });

      const mockPassportPromise = {
        ok: true,
        json: () => mockJsonPromise
      } as unknown as Response;

      (fetchPassport as jest.Mock).mockResolvedValueOnce(mockPassportPromise);

      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByText("Ineligible for matching")).toBeInTheDocument();
        expect(screen.getByText("Current score. Reach 0 to have your donation matched.")).toBeInTheDocument();
      });
    });

    it("IF passport state is match eligible THEN it shows eligible for matching", async () => {
      (fetchPassport as jest.Mock).mockResolvedValueOnce(mockPassportPromise);

      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByText("Eligible for matching")).toBeInTheDocument();
        expect(screen.getByText("You are eligible for matching. Happy donating!")).toBeInTheDocument();
        expect(screen.getByTestId("passport-score")).toBeInTheDocument();
        expect(screen.getByTestId("threshold")).toBeInTheDocument();
      });
    });

    it("IF passport state is not connected THEN it shows ineligible for matching", async () => {
      (fetchPassport as jest.Mock).mockResolvedValueOnce(mockPassportPromise);
      mockAccount.isConnected = false;

      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByText("Ineligible for matching")).toBeInTheDocument();
        expect(screen.getByText("Please connect to Passport in order continue.")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation Buttons", () => {

    it("shows Home and Connect to Passport breadcrumb", () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Connect to Passport")).toBeInTheDocument();
    });

    it("shows back to browsing button on page load", () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      expect(
        screen.getByTestId("back-to-browsing-button")
      ).toBeInTheDocument();
    });

  });

  describe("Passport Instructions", () => {

    it("Should show both tabs Have a Passport and Don't have a Passport on page load", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      expect(screen.getByText("Have a Passport?")).toBeInTheDocument();
      expect(screen.getByText("Don't have a Passport?")).toBeInTheDocument();
    });

    it("Should show Passport Instructions on click of Have a Passport tab", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      fireEvent.click(screen.getByText("Have a Passport?"));

      expect(screen.getByText("Connect to Passport")).toBeInTheDocument();
    });

    it("Should show Passport Instructions on click of Don't have a Passport tab", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      fireEvent.click(screen.getByText("Don't have a Passport?"));

      expect(screen.getByText("Connect your wallet to Passport. You will be taken to a new window to begin verifying your identity.")).toBeInTheDocument();
    });

  });

  describe("Passport Connect", () => {

    it("Should show the Open Passport button", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      expect(screen.getByTestId("open-passport")).toBeInTheDocument();
    });

    it("Should show the Recalculate Score button", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      expect(screen.getByTestId("recalculate-score")).toBeInTheDocument();
    });

    it("Clicking the Recalculate Score button invokes submitPassport", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      (submitPassport as jest.Mock).mockResolvedValueOnce(mockPassportPromise);
      (fetchPassport as jest.Mock).mockResolvedValueOnce(mockPassportPromise);

      fireEvent.click(screen.getByTestId("recalculate-score"));
      expect(submitPassport).toHaveBeenCalled();
    });

  });

});
