import { render, screen, waitFor } from "@testing-library/react";
import PassportBanner from "../PassportBanner";
import { BrowserRouter } from "react-router-dom";
import { fetchPassport } from "../../api/passport";
import { faker } from "@faker-js/faker";
import { mockBalance, mockNetwork, mockSigner } from "../../../test-utils";

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

jest.mock("../../../features/api/passport");

process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID = '12';

describe("PassportBanner", () => {
  describe("renders the correct banner", () => {

    it("WHEN user is not connected to passport THEN it shows the not connected banner", () => {
      mockAccount.isConnected = false;
      render(<PassportBanner/>, { wrapper: BrowserRouter });
      expect(screen.getByTestId("wallet-not-connected")).toBeInTheDocument();
      expect(screen.getByTestId("connect-wallet-button")).toBeInTheDocument();
    });

    it("WHEN user is connected to passport and is ELIGIBLE for match THEN it shows the eligible for matching banner", async () => {

      mockAccount.isConnected = true;

      const mockJsonPromise = Promise.resolve({
        score: "1",
        address: userAddress,
      });

      const mockFetchPassportPromise = {
        ok: true,
        json: () => mockJsonPromise
      } as unknown as Response;

      (fetchPassport as jest.Mock).mockResolvedValueOnce(mockFetchPassportPromise)

      render(<PassportBanner/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("match-eligible")).toBeInTheDocument();
        expect(screen.getByTestId("view-score-button")).toBeInTheDocument();
      });

    });

    it("WHEN user is connected to passport and is not ELIGIBLE for match THEN it shows the not eligible for matching banner", async () => {
      mockAccount.isConnected = true;

      const mockJsonPromise = Promise.resolve({
        score: "-1",
        address: userAddress,
      });

      const mockFetchPassportPromise = {
        ok: true,
        json: () => mockJsonPromise
      } as unknown as Response;

      (fetchPassport as jest.Mock).mockReturnValueOnce(mockFetchPassportPromise)

      render(<PassportBanner/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("match-ineligible")).toBeInTheDocument();
        expect(screen.getByTestId("view-score-button")).toBeInTheDocument();
      });
    });

    it("WHEN user is connected to passport and is LOADING for match THEN it shows the passport loading banner", () => {

      mockAccount.isConnected = true;

      const mockJsonPromise = Promise.resolve({
        score: "1",
        address: userAddress,
      });

      const mockFetchPassportPromise = {
        ok: true,
        json: () => mockJsonPromise
      } as unknown as Response;

      (fetchPassport as jest.Mock).mockReturnValueOnce(mockFetchPassportPromise)

      render(<PassportBanner/>, { wrapper: BrowserRouter });

      expect(screen.getByTestId("loading-passport-score")).toBeInTheDocument();
    });

    it("WHEN user is connected to passport and is an invalid passport THEN it shows the invalid matching banner", async () => {

      mockAccount.isConnected = true;

      const mockJsonPromise = Promise.resolve({
        address: userAddress,
      });

      const mockFetchPassportPromise = {
        ok: false,
        json: () => mockJsonPromise,
        status: 400,
      } as unknown as Response;

      (fetchPassport as jest.Mock).mockReturnValueOnce(mockFetchPassportPromise)

      render(<PassportBanner/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("invalid-passport")).toBeInTheDocument();
        expect(screen.getByTestId("visit-passport-button")).toBeInTheDocument();
      });
    });

    it("WHEN user is connected to passport and it errors out THEN it shows the error banner", async () => {
      mockAccount.isConnected = true;

      const mockJsonPromise = Promise.resolve({});

      const mockFetchPassportPromise = {
        ok: false,
        json: () => mockJsonPromise,
        status: 401,
      } as unknown as Response;

      (fetchPassport as jest.Mock).mockReturnValueOnce(mockFetchPassportPromise)

      render(<PassportBanner/>, { wrapper: BrowserRouter });

      await waitFor(() => {
        expect(screen.getByTestId("error-loading-passport")).toBeInTheDocument();
      });
    });
  });
});
