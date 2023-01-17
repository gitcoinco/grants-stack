import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import PassportConnect from "../PassportConnect";
import { BrowserRouter } from "react-router-dom";
import { fetchPassport, submitPassport } from "../../api/passport";
import { mockBalance, mockNetwork, mockSigner } from "../../../test-utils";

const chainId = 5;
const roundId = faker.finance.ethereumAddress();

jest.mock("../../api/passport");
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
  status: "DONE",
  evidence: {
    threshold: "0",
    rawScore: "1",
  },
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

  describe("Navigation Buttons", () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("shows Home and Connect to Passport breadcrumb", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Connect to Passport")).toBeInTheDocument();
      })
    });

    it("shows back to browsing button on page load", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("back-to-browsing-button")).toBeInTheDocument();
      });
    });

    it("shows create a passport button on page load", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("create-passport-button")).toBeInTheDocument();
      });
    });

    it("shows need help link on page load", async() => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("need-help-link")).toBeInTheDocument();
      });
    });

    it("shows what is passport link on page load", async() => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("what-is-passport-link")).toBeInTheDocument();
      })
    });

  });

  describe("Passport Connect", () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("Should show the Create Passport button", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("create-passport-button")).toBeInTheDocument();
      });
    });

    it("Should show the Recalculate Score button", async () => {
      render(<PassportConnect/>, { wrapper: BrowserRouter });
      await waitFor(() => {
        expect(screen.getByTestId("recalculate-score-button")).toBeInTheDocument();
      });
    });

    it("Clicking the Recalculate Score button invokes submitPassport", async () => {
      (fetchPassport as jest.Mock).mockResolvedValueOnce(mockPassportPromise);
      (submitPassport as jest.Mock).mockResolvedValueOnce(jest.fn());

      render(<PassportConnect/>, { wrapper: BrowserRouter });

      await waitFor(async () => {
        fireEvent.click(await screen.findByTestId("recalculate-score-button"));

        expect(submitPassport).toHaveBeenCalled();
        expect(fetchPassport).toHaveBeenCalled();
      });
    });

  });
});

describe("<PassportConnect/>", () => {

  describe("PassportConnect Passport State", () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("IF passport state is match inelgible THEN it shows ineligible for matching", async () => {
      const mockJsonPromise = Promise.resolve({
        score: "-1",
        address: userAddress,
        status: "DONE",
        evidence: {
          threshold: "0",
          rawScore: "-1",
        },
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
});