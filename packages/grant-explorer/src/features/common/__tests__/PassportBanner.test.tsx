import { render, screen } from "@testing-library/react";
import PassportBanner from "../PassportBanner";
import { PassportState, usePassport } from "../../api/passport";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../../features/api/passport");

describe("PassportBanner", () => {

  const chainId = "5";
  const roundId = "0x123";

  describe("renders the correct banner", () => {

    it("WHEN user is not connected to passport THEN it shows the not connected banner", () => {

      (usePassport as jest.Mock).mockReturnValueOnce({
        passportState: PassportState.NOT_CONNECTED
      });

      render(<PassportBanner chainId={chainId} roundId={roundId} />, { wrapper: BrowserRouter });

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

      render(<PassportBanner chainId={chainId} roundId={roundId} />, { wrapper: BrowserRouter });

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

      render(<PassportBanner chainId={chainId} roundId={roundId} />, { wrapper: BrowserRouter });

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

      render(<PassportBanner chainId={chainId} roundId={roundId} />, { wrapper: BrowserRouter });

      expect(
        screen.getByTestId("loading-passport-score")
      ).toBeInTheDocument();

    });

    it("WHEN user is connected to passport and is an invalid passport THEN it shows the invalid matching banner", () => {

      (usePassport as jest.Mock).mockReturnValueOnce({
        passportState: PassportState.INVALID_PASSPORT
      });

      render(<PassportBanner chainId={chainId} roundId={roundId} />, { wrapper: BrowserRouter });

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

      render(<PassportBanner chainId={chainId} roundId={roundId} />, { wrapper: BrowserRouter });

      expect(
        screen.getByTestId("error-loading-passport")
      ).toBeInTheDocument();
    });

  });
});
