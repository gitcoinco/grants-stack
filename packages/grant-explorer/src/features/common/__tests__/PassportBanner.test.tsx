import { render, screen } from "@testing-library/react";
import PassportBanner from "../PassportBanner";
import { faker } from "@faker-js/faker";
import { BigNumber, ethers } from "ethers";
import { PassportState, usePassport } from "../../api/passport";
const chainId = 5;
const roundId = faker.finance.ethereumAddress();
const userAddress = faker.finance.ethereumAddress();

jest.mock("../../../features/api/passport");

const mockAccount = {
  address: userAddress,
};

const mockBalance = {
  data: {
    value: BigNumber.from(ethers.utils.parseUnits("10", 18)),
  },
};

const mockSigner = {
  data: {},
};

const mockNetwork = {
  chain: {
    id: 5,
    name: "Goerli",
  },
  chains: [
    {
      id: 10,
      name: "Optimism",
    },
    {
      id: 5,
      name: "Goerli",
    },
  ],
};

const useParamsFn = () => ({
  chainId,
  roundId,
});

jest.mock("../../common/Navbar");
jest.mock("../../common/Auth");
jest.mock("wagmi", () => ({
  useAccount: () => mockAccount,
  useBalance: () => mockBalance,
  useSigner: () => mockSigner,
  useNetwork: () => mockNetwork,
}));
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
  ...jest.requireActual("@rainbow-me/rainbowkit"),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: useParamsFn,
}));

describe("PassportBanner", () => {

  describe("renders the correct banner", () => {

    it("WHEN user is not connected to passport THEN it shows the not connected banner", () => {

      (usePassport as jest.Mock).mockReturnValueOnce({
        passportState: PassportState.NOT_CONNECTED
      });

      render(<PassportBanner />);

      expect(
        screen.getByTestId("wallet-not-connected")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("connect-wallet-button")
      ).toBeInTheDocument();
    });

    it("WHEN user is connected to passport and is ELIGIBLE for match THEN it shows the eligible for matching banner", () => {

      (usePassport as jest.Mock).mockReturnValueOnce({
        passportState: PassportState.MATCH_ELIGIBLE
      });

      render(<PassportBanner />);

      expect(
        screen.getByTestId("match-eligible")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("view-score-button")
      ).toBeInTheDocument();
    });

    it("WHEN user is connected to passport and is not ELIGIBLE for match THEN it shows the not eligible for matching banner", () => {

      (usePassport as jest.Mock).mockReturnValueOnce({
        passportState: PassportState.MATCH_INELIGIBLE
      });

      render(<PassportBanner />);

      expect(
        screen.getByTestId("match-ineligible")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("view-score-button")
      ).toBeInTheDocument();
    });

    it("WHEN user is connected to passport and is LOADING for match THEN it shows the passport loading banner", () => {

      (usePassport as jest.Mock).mockReturnValueOnce({
        passportState: PassportState.LOADING
      });

      render(<PassportBanner />);

      expect(
        screen.getByTestId("loading-passport-score")
      ).toBeInTheDocument();

    });

    it("WHEN user is connected to passport and is an invalid passport THEN it shows the invalid matching banner", () => {

      (usePassport as jest.Mock).mockReturnValueOnce({
        passportState: PassportState.INVALID_PASSPORT
      });

      render(<PassportBanner />);

      expect(
        screen.getByTestId("invalid-passport")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("visit-passport-button")
      ).toBeInTheDocument();
    });

    it("WHEN user is connected to passport and it errors out THEN it shows the error banner", () => {

      (usePassport as jest.Mock).mockReturnValueOnce({
        passportState: PassportState.ERROR
      });

      render(<PassportBanner />);

      expect(
        screen.getByTestId("error-loading-passport")
      ).toBeInTheDocument();
    });

  });
});
