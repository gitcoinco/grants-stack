/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { makeProgramData, renderWrapped } from "../../../test-utils";

import { FormStepper } from "../../common/FormStepper";
import { RoundDetailForm } from "../RoundDetailForm";
import { FormContext } from "../../common/FormWizard";
import {
  ChainId,
  CHAINS,
  getPayoutTokenOptions,
  getVotingOptions,
} from "../../api/utils";
import { useWallet } from "../../common/Auth";
import { faker } from "@faker-js/faker";
import moment from "moment";

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
    chain: { id: ChainId.GOERLI_CHAIN_ID },
  });
});

describe("<RoundDetailForm />", () => {
  it("renders round name input", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const roundNameInput = await screen.getByLabelText("Round Name");
    expect(roundNameInput).toBeInTheDocument();
  });

  it("requires round name input to not be empty", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = await screen.getByRole("button", {
      name: /next|launch/i,
    });
    const input = await screen.getByRole("textbox", {
      name: /round name/i,
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });
    const error = input.parentElement?.querySelector("p");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("This field is required.");
  });

  it("requires round name to be longer than 8 characters", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = await screen.getByRole("button", {
      name: /next|launch/i,
    });
    const input = await screen.getByRole("textbox", {
      name: /round name/i,
    });
    await act(async () => {
      fireEvent.input(input, {
        target: {
          value: "shrtnm",
        },
      });
      fireEvent.click(submitButton);
    });
    const error = input.parentElement?.querySelector("p");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent(
      "Round name must be at least 8 characters."
    );
  });

  it("renders submit button", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const nextButton = await screen.getByRole("button", {
      name: /next|launch/i,
    });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveTextContent("Launch");
  });

  it("renders date components", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const startDateInputs = await screen.getAllByLabelText("Start Date");
    expect(startDateInputs[0]).toBeInTheDocument();
    expect(startDateInputs[1]).toBeInTheDocument();
    expect(startDateInputs[0].id).toBe("applicationsStartTime");
    expect(startDateInputs[1].id).toBe("roundStartTime");

    const endDateInputs = await screen.getAllByLabelText("End Date");
    expect(endDateInputs[0]).toBeInTheDocument();
    expect(endDateInputs[1]).toBeInTheDocument();
    expect(endDateInputs[0].id).toBe("applicationsEndTime");
    expect(endDateInputs[1].id).toBe("roundEndTime");
  });

  it("renders contact information input", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const contactInfoInput = await screen.getByLabelText("Contact Information");
    expect(contactInfoInput).toBeInTheDocument();
  });

  it("requires contact information input to not be empty", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = await screen.getByRole("button", {
      name: /next|launch/i,
    });
    const input = await screen.getByRole("textbox", {
      name: /contact information/i,
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });
    const error = input.parentElement?.querySelector("p");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("This field is required.");
  });

  it("requires contact information to be of type email when support type is email", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = await screen.getByRole("button", {
      name: /next|launch/i,
    });
    const supportSelection = screen.getByTestId("support-type-select");
    fireEvent.click(supportSelection);
    const firstSupportOption = screen.getAllByTestId("support-type-option")[0];
    fireEvent.click(firstSupportOption);
    const infoInput = await screen.getByRole("textbox", {
      name: /contact information/i,
    });
    await act(async () => {
      fireEvent.click(firstSupportOption);
      fireEvent.input(infoInput, {
        target: {
          value: "shrtnm",
        },
      });
      fireEvent.click(submitButton);
    });
    const error = infoInput.parentElement?.querySelector("p");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent(
      "roundMetadata.support.info must be a valid email"
    );
  });

  it("requires contact information to be of type URL when support type is NOT email", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = await screen.getByRole("button", {
      name: /next|launch/i,
    });
    const supportSelection = screen.getByTestId("support-type-select");
    fireEvent.click(supportSelection);
    const firstSupportOption = screen.getAllByTestId("support-type-option")[1];
    fireEvent.click(firstSupportOption);
    const infoInput = await screen.getByRole("textbox", {
      name: /contact information/i,
    });
    await act(async () => {
      fireEvent.click(firstSupportOption);
      fireEvent.input(infoInput, {
        target: {
          value: "shrtnm",
        },
      });
      fireEvent.click(submitButton);
    });
    const error = infoInput.parentElement?.querySelector("p");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent(
      "roundMetadata.support.info must be a valid URL"
    );
  });

  it("validates round start time is after application start time", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const startDateInputs = await screen.getAllByLabelText("Start Date");

    await act(async () => {
      /* Prefill round name to ignore errors from it */
      fireEvent.input(screen.getByLabelText("Round Name"), {
        target: { value: "testinground" },
      });

      /* Applicactions start date */
      expect(startDateInputs[0].id).toBe("applicationsStartTime");
      fireEvent.change(startDateInputs[0], {
        target: { value: "08/25/2022 12:00 AM" },
      });

      /* Round start date */
      expect(startDateInputs[1].id).toBe("roundStartTime");
      fireEvent.change(startDateInputs[1], {
        target: { value: "08/24/2022 12:00 AM" },
      });

      /* Trigger validation */
      fireEvent.click(screen.getByText("Launch"));
    });

    const errors = await screen.getByText(
      "Round start date must be later than applications start date"
    );
    expect(errors).toBeInTheDocument();
  });

  it("validates applications end date is after applications start date", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const startDateInputs = await screen.getAllByLabelText("Start Date");
    const endDateInputs = await screen.getAllByLabelText("End Date");

    await act(async () => {
      /* Prefill round name to ignore errors from it */
      fireEvent.input(screen.getByLabelText("Round Name"), {
        target: { value: "testinground" },
      });

      /* Applicactions start date */
      expect(startDateInputs[0].id).toBe("applicationsStartTime");
      fireEvent.change(startDateInputs[0], {
        target: { value: "08/25/2022 12:00 AM" },
      });

      /* Application end date */
      expect(endDateInputs[0].id).toBe("applicationsEndTime");
      fireEvent.change(endDateInputs[0], {
        target: { value: "08/24/2022 12:00 AM" },
      });

      /* Trigger validation */
      fireEvent.click(screen.getByText("Launch"));
    });

    const errors = await screen.getByText(
      "Applications end date must be later than applications start date"
    );
    expect(errors).toBeInTheDocument();
  });

  it("validates round end date is after round start date", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const startDateInputs = await screen.getAllByLabelText("Start Date");
    const endDateInputs = await screen.getAllByLabelText("End Date");

    await act(async () => {
      /* Prefill round name to ignore errors from it */
      fireEvent.input(screen.getByLabelText("Round Name"), {
        target: { value: "testinground" },
      });

      /* Round start date */
      expect(startDateInputs[1].id).toBe("roundStartTime");
      fireEvent.change(startDateInputs[1], {
        target: { value: "08/25/2022 12:00 AM" },
      });

      /* Round end date */
      expect(endDateInputs[1].id).toBe("roundEndTime");
      fireEvent.change(endDateInputs[1], {
        target: { value: "08/24/2022 12:00 AM" },
      });

      /* Trigger validation */
      fireEvent.click(screen.getByText("Launch"));
    });

    const errors = await screen.getByText(
      "Round end date must be later than the round start date"
    );
    expect(errors).toBeInTheDocument();
  });

  it("goes to next page when passing validation", async () => {
    const applicationsStartTime = faker.date.soon();
    const applicationsEndTime = faker.date.soon(10, applicationsStartTime);
    const roundStartTime = faker.date.future(1, applicationsEndTime);
    const roundEndTime = faker.date.soon(21, roundStartTime);
    const setCurrentStep = jest.fn();
    const setFormData = jest.fn();
    renderWrapped(
      <FormContext.Provider
        value={{
          currentStep: 0,
          setCurrentStep,
          stepsCount: 1,
          formData: {},
          setFormData,
        }}
      >
        <RoundDetailForm stepper={FormStepper} />
      </FormContext.Provider>
    );
    const startDateInputs = await screen.getAllByLabelText("Start Date");
    const endDateInputs = await screen.getAllByLabelText("End Date");

    /* Round Name */
    fireEvent.input(screen.getByLabelText("Round Name"), {
      target: { value: "testinground" },
    });

    /* Support Selection */
    const supportSelection = screen.getByTestId("support-type-select");
    fireEvent.click(supportSelection);
    const firstSupportOption = screen.getAllByTestId("support-type-option")[0];
    fireEvent.click(firstSupportOption);

    /* Contact Information */
    fireEvent.input(screen.getByLabelText("Contact Information"), {
      target: { value: "johndoe@example.com" },
    });

    /* Applications start date */
    expect(startDateInputs[0].id).toBe("applicationsStartTime");
    fireEvent.change(startDateInputs[0], {
      target: {
        value: moment(applicationsStartTime).format("MM/DD/YYYY h:mm A"),
      },
    });

    /* Applications end date */
    expect(endDateInputs[0].id).toBe("applicationsEndTime");
    fireEvent.change(endDateInputs[0], {
      target: {
        value: moment(applicationsEndTime).format("MM/DD/YYYY h:mm A"),
      },
    });

    /* Round start date */
    expect(startDateInputs[1].id).toBe("roundStartTime");
    fireEvent.change(startDateInputs[1], {
      target: { value: moment(roundStartTime).format("MM/DD/YYYY h:mm A") },
    });

    /* Round end date */
    expect(endDateInputs[1].id).toBe("roundEndTime");
    fireEvent.change(endDateInputs[1], {
      target: { value: moment(roundEndTime).format("MM/DD/YYYY h:mm A") },
    });

    /* Payout Token */
    const payoutTokenSelection = screen.getByTestId("payout-token-select");
    fireEvent.click(payoutTokenSelection);
    const firstTokenOption = screen.getAllByTestId("payout-token-option")[0];
    fireEvent.click(firstTokenOption);

    fireEvent.change(screen.getByTestId("matching-funds-available"), {
      target: { value: 1 },
    });

    /* Trigger validation */
    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      expect(setCurrentStep).toBeCalled();
      expect(setFormData).toBeCalled();
    });

    expect(
      screen.queryByTestId("application-start-date-error")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("application-end-date-error")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("round-start-date-error")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("round-end-date-error")
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(setCurrentStep).toHaveBeenCalled();
      expect(setFormData).toHaveBeenCalled();
    });
    expect(setCurrentStep).toHaveBeenCalledWith(1);
    expect(setFormData).toHaveBeenCalledTimes(1);
  });

  it("renders program chain name", async () => {
    const chain = CHAINS[ChainId.OPTIMISM_MAINNET_CHAIN_ID]!;
    const program = makeProgramData({
      chain: { id: chain.id, name: chain.name, logo: chain.logo },
    });

    renderWrapped(
      <RoundDetailForm stepper={FormStepper} initialData={{ program }} />
    );

    expect(screen.getByText(chain.name!)).toBeInTheDocument();
    expect(screen.getByTestId("chain-logo")).toBeInTheDocument();
  });

  describe.only("Quadratic Funding Settings", () => {
    it("renders the quadratic funding settings section", () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);

      expect(
        screen.getByText(/Quadratic Funding Settings/i)
      ).toBeInTheDocument();
    });

    it("renders a dropdown list of tokens when payout token input is clicked", async () => {
      const options = getPayoutTokenOptions(ChainId.GOERLI_CHAIN_ID);

      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      const payoutTokenSelection = screen.getByTestId("payout-token-select");
      fireEvent.click(payoutTokenSelection);

      const selectOptions = await screen.findAllByTestId("payout-token-option");
      expect(selectOptions).toHaveLength(options.length);
    });

    it("shows validation error message when the payout token is not selected", async () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      const payoutTokenSelection = screen.getByTestId("payout-token-select");
      fireEvent.click(payoutTokenSelection);

      fireEvent.click(screen.getByText("Launch"));

      const errors = await screen.findByText(
        "You must select a payout token for your round."
      );
      expect(errors).toBeInTheDocument();
    });

    it("renders matching funds available & matching cap input fields", () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);

      expect(
        screen.getByTestId("matching-funds-available")
      ).toBeInTheDocument();
      expect(screen.getByTestId("matching-cap-selection")).toBeInTheDocument();
      expect(screen.getByTestId("matching-cap-true")).toBeInTheDocument();
      expect(screen.getByTestId("matching-cap-false")).toBeInTheDocument();
      expect(screen.getByTestId("matching-cap-percent")).toBeInTheDocument();
    });

    it("enables matching cap when matching cap is selected to 'Yes'", () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      fireEvent.click(screen.getByTestId("matching-cap-true"));

      expect(screen.getByTestId("matching-cap-percent")).toBeEnabled();
    });

    it("defaults matching cap to be disabled", () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      expect(screen.getByTestId("matching-cap-percent")).toBeDisabled();
    });

    it("shows validation error message when matching funds amount is not provided", async () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      fireEvent.click(screen.getByText("Launch"));

      const errors = await screen.findByText(
        "Matching funds available must be valid number."
      );
      expect(errors).toBeInTheDocument();
    });

    it("shows validation error message when matching funds amount is <= zero", async () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      fireEvent.change(screen.getByTestId("matching-funds-available"), {
        target: { value: 0 },
      });
      fireEvent.click(screen.getByText("Launch"));

      const errors = await screen.findByText(
        "Matching funds available must be more than zero."
      );
      expect(errors).toBeInTheDocument();
    });

    it("shows validation error message if matching cap percentage is not provided", async () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      fireEvent.click(screen.getByTestId("matching-cap-true"));
      fireEvent.click(screen.getByText("Launch"));

      const errors = await screen.findByText(
        "You must provide an amount for the matching cap."
      );
      expect(errors).toBeInTheDocument();
    });

    it("shows validation error message if matching cap percentage is <= zero", async () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      fireEvent.click(screen.getByTestId("matching-cap-true"));
      fireEvent.change(screen.getByTestId("matching-cap-percent"), {
        target: { value: 0 },
      });
      fireEvent.click(screen.getByText("Launch"));

      const errors = await screen.findByText(
        "Matching cap amount must be more than zero."
      );
      expect(errors).toBeInTheDocument();
    });

    it("renders voting strategy input", async () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      const contactInfoInput = await screen.getByLabelText("Voting Strategy");
      expect(contactInfoInput).toBeInTheDocument();
    });

    it("renders a dropdown list of voting strategies when voting strategy input is clicked", async () => {
      const options = getVotingOptions();

      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      const votingStrategySelection = screen.getByTestId(
        "voting-strategy-select"
      );
      fireEvent.click(votingStrategySelection);

      const selectOptions = await screen.findAllByTestId(
        "voting-strategy-option"
      );
      expect(selectOptions).toHaveLength(options.length);
    });

    it("shows validation error message when the voting strategy is not selected", async () => {
      renderWrapped(<RoundDetailForm stepper={FormStepper} />);
      const votingStrategySelection = screen.getByTestId(
        "voting-strategy-select"
      );
      fireEvent.click(votingStrategySelection);

      fireEvent.click(screen.getByText("Launch"));

      const errors = await screen.findByText(
        "You must select a voting strategy for your round."
      );
      expect(errors).toBeInTheDocument();
    });
  });
});
