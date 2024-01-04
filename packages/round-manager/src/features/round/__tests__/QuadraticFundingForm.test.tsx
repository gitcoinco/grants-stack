/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";
import { ChainId } from "common";

import { useWallet } from "../../common/Auth";
import { FormStepper } from "../../common/FormStepper";
import QuadraticFundingForm from "../QuadraticFundingForm";
import { getPayoutTokenOptions } from "../../api/payoutTokens";

jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

beforeEach(() => {
  (useWallet as jest.Mock).mockReturnValue({
    chain: { id: ChainId.OPTIMISM_MAINNET_CHAIN_ID },
  });
});

describe("<QuadraticFundingForm />", () => {
  beforeEach(() => {
    renderWrapped(<QuadraticFundingForm stepper={FormStepper} />);
  });

  it("selects payout token", function () {
    const payoutTokenSelection = screen.getByTestId("payout-token-select");
    fireEvent.click(payoutTokenSelection);
    const firstTokenOption = screen.getAllByTestId("payout-token-option")[0];
    fireEvent.click(firstTokenOption);
    fireEvent.change(screen.getByTestId("matching-funds-available"), {
      target: { value: 1 },
    });
  });

  it("renders the quadratic funding settings section", () => {
    expect(screen.getByText(/Quadratic Funding Settings/i)).toBeInTheDocument();
  });

  it("renders a dropdown list of tokens when payout token input is clicked", async () => {
    const options = getPayoutTokenOptions(ChainId.OPTIMISM_MAINNET_CHAIN_ID);

    const payoutTokenSelection = screen.getByTestId("payout-token-select");
    fireEvent.click(payoutTokenSelection);

    const selectOptions = await screen.findAllByTestId("payout-token-option");
    expect(selectOptions).toHaveLength(options.length);
  });

  it("shows validation error message when the payout token is not selected", async () => {
    const payoutTokenSelection = screen.getByTestId("payout-token-select");
    fireEvent.click(payoutTokenSelection);

    fireEvent.click(screen.getByText("Launch"));

    const errors = await screen.findByText(
      "You must select a payout token for your round."
    );
    expect(errors).toBeInTheDocument();
  });

  it("renders matching funds available & matching cap input fields", () => {
    expect(screen.getByTestId("matching-funds-available")).toBeInTheDocument();
    expect(screen.getByTestId("matching-cap-selection")).toBeInTheDocument();
    expect(screen.getByTestId("matching-cap-true")).toBeInTheDocument();
    expect(screen.getByTestId("matching-cap-false")).toBeInTheDocument();
    expect(screen.getByTestId("matching-cap-percent")).toBeInTheDocument();
  });

  it("enables matching cap when matching cap is selected to 'Yes'", () => {
    fireEvent.click(screen.getByTestId("matching-cap-true"));

    expect(screen.getByTestId("matching-cap-percent")).toBeEnabled();
  });

  it("defaults matching cap to be disabled", () => {
    expect(screen.getByTestId("matching-cap-percent")).toBeDisabled();
  });

  it("shows validation error message when matching funds amount is not provided", async () => {
    fireEvent.change(screen.getByTestId("matching-funds-available"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("Launch"));

    const errors = await screen.findByText(
      "Matching funds available must be a valid number."
    );
    expect(errors).toBeInTheDocument();
  });

  it("shows validation error message when matching funds amount is <= zero", async () => {
    fireEvent.change(screen.getByTestId("matching-funds-available"), {
      target: { value: 0 },
    });
    fireEvent.click(screen.getByText("Launch"));

    const errors = await screen.findByText(
      "Matching funds available must be more than zero."
    );
    expect(errors).toBeInTheDocument();
  });

  it("shows validation error message if matching cap is selected and has not be set by the user", async () => {
    fireEvent.click(screen.getByTestId("matching-cap-true"));
    fireEvent.click(screen.getByText("Launch"));
    const errors = await screen.findByTestId("matching-cap-error");
    expect(errors).toBeInTheDocument();
    expect(errors).toHaveTextContent(
      "You must provide an amount for the matching cap."
    );
  });

  it("shows validation error message if matching cap amount is <= zero", async () => {
    fireEvent.click(screen.getByTestId("matching-cap-true"));
    fireEvent.change(screen.getByTestId("matching-cap-percent"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByText("Launch"));
    const errors = await screen.findByTestId("matching-cap-error");
    expect(errors).toBeInTheDocument();
    expect(errors).toHaveTextContent(
      "Matching cap amount must be more than zero."
    );
  });
  it("shows validation error message if matching cap amount is > 100", async () => {
    fireEvent.click(screen.getByTestId("matching-cap-true"));
    fireEvent.change(screen.getByTestId("matching-cap-percent"), {
      target: { value: "101" },
    });
    fireEvent.click(screen.getByText("Launch"));
    const errors = await screen.findByTestId("matching-cap-error");
    expect(errors).toBeInTheDocument();
    expect(errors).toHaveTextContent(
      "Matching cap amount must be less than or equal to 100%."
    );
  });

  it("shows validation error message if minimum donation threshold is not provided", async () => {
    fireEvent.click(screen.getByTestId("min-donation-true"));
    fireEvent.click(screen.getByText("Launch"));
    const errors = await screen.findByText(
      "You must provide an amount for the minimum donation threshold."
    );
    expect(errors).toBeInTheDocument();
  });

  it("shows validation error message if minimum donation threshold is <= zero", async () => {
    fireEvent.click(screen.getByTestId("min-donation-true"));
    fireEvent.change(screen.getByTestId("min-donation-amount"), {
      target: { value: "-1" },
    });
    fireEvent.click(screen.getByText("Launch"));
    const errors = await screen.findByText(
      "Minimum donation threshold must be more than zero."
    );
    expect(errors).toBeInTheDocument();
  });
});
