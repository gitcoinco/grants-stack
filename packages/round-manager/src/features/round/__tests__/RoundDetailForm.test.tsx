/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { makeProgramData, renderWrapped } from "../../../test-utils";

import { faker } from "@faker-js/faker";
import moment from "moment";
import { ChainId, CHAINS } from "../../api/utils";
import { useWallet } from "../../common/Auth";
import { FormStepper } from "../../common/FormStepper";
import { FormContext } from "../../common/FormWizard";
import { RoundDetailForm } from "../RoundDetailForm";

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
    const roundNameInput = screen.getByLabelText("Round Name");
    expect(roundNameInput).toBeInTheDocument();
  });

  it("requires round name input to not be empty", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = screen.getByRole("button", {
      name: /next|launch/i,
    });
    const input = screen.getByRole("textbox", {
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
    const submitButton = screen.getByRole("button", {
      name: /next|launch/i,
    });
    const input = screen.getByRole("textbox", {
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
    const nextButton = screen.getByRole("button", {
      name: /next|launch/i,
    });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toHaveTextContent("Launch");
  });

  it("renders date components", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);

    const appStartDateInput = screen.getByTestId("roundApplicationsStartTime-testid");
    const appEndDateInput = screen.getByTestId("roundApplicationsEndTime-testid");
    const roundStartDateInput = screen.getByTestId("roundVotingStartTime-testid");
    const roundEndDateInput = screen.getByTestId("roundVotingEndTime-testid");

    expect(appStartDateInput).toBeInTheDocument();
    expect(appEndDateInput).toBeInTheDocument();
    expect(roundStartDateInput).toBeInTheDocument();
    expect(roundEndDateInput).toBeInTheDocument();
  });

  it("renders contact information input", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const contactInfoInput = screen.getByLabelText("Contact Information");
    expect(contactInfoInput).toBeInTheDocument();
  });

  it("renders round type selection radio button", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const roundTypeRadioBtn = screen.getByTestId("round-type-selection");
    expect(roundTypeRadioBtn).toBeInTheDocument();
  });

  it("requires contact information input to not be empty", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = screen.getByRole("button", {
      name: /next|launch/i,
    });
    const input = screen.getByRole("textbox", {
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
    const submitButton = screen.getByRole("button", {
      name: /next|launch/i,
    });

    const supportSelection = screen.getByTestId("roundSupport.type-testid");
    fireEvent.click(supportSelection);

    const emailSupportOption = screen.getByTestId("roundSupport.type-option-Email");
    fireEvent.click(emailSupportOption);

    const infoInput = screen.getByRole("textbox", {
      name: /contact information/i,
    });
    await act(async () => {
      fireEvent.input(infoInput, {
        target: {
          value: "shrtnm",
        },
      });
      fireEvent.click(submitButton);
    });

    const error = infoInput.parentElement?.querySelector("p");
    expect(error).toBeInTheDocument();
  });

  it("requires contact information to be of type URL when support type is NOT email", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = screen.getByRole("button", {
      name: /next|launch/i,
    });

    const supportSelection = screen.getByTestId("roundSupport.type-testid");
    fireEvent.click(supportSelection);

    const webSupportOption = screen.getByTestId("roundSupport.type-option-Website");
    fireEvent.click(webSupportOption);

    const infoInput = screen.getByRole("textbox", {
      name: /contact information/i,
    });

    await act(async () => {
      fireEvent.click(webSupportOption);
      fireEvent.input(infoInput, {
        target: {
          value: "shrtnm",
        },
      });
      fireEvent.click(submitButton);
    });

    const error = infoInput.parentElement?.querySelector("p");
    expect(error).toBeInTheDocument();

  });

  it("validates round start time is after application start time", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);

    const appStartDateInput = screen.getByTestId("roundApplicationsStartTime-testid");
    const appEndDateInput = screen.getByTestId("roundApplicationsEndTime-testid");
    const roundStartDateInput = screen.getByTestId("roundVotingStartTime-testid");
    const roundEndDateInput = screen.getByTestId("roundVotingEndTime-testid");

    await act(async () => {
      /* Prefill round name to ignore errors from it */
      fireEvent.input(screen.getByTestId("roundName-testid"), {
        target: { value: "testinground" },
      });

      /* Applicactions start date */
      fireEvent.change(appStartDateInput, {
        target: { value: "08/25/2022 12:00 AM" },
      });

      /* Round start date */
      fireEvent.change(roundStartDateInput, {
        target: { value: "08/24/2022 12:01 AM" },
      });

      /* Applications end date */
      fireEvent.change(appEndDateInput, {
        target: { value: "08/25/2022 12:00 AM" },
      });

      /* Round end date */
      fireEvent.change(roundEndDateInput, {
        target: { value: "08/24/2022 12:00 AM" },
      });

      /* Click next button */ 
      fireEvent.click(screen.getByRole("button", { name: /next|launch/i }));

      // fails to move to next step
      expect(appEndDateInput).toBeInTheDocument();

    });
    
  });

  it("validates applications end date is after applications start date", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    
    const appStartDateInput = screen.getByTestId("roundApplicationsStartTime-testid");
    const appEndDateInput = screen.getByTestId("roundApplicationsEndTime-testid");

    await act(async () => {
      /* Prefill round name to ignore errors from it */
      fireEvent.input(screen.getByTestId("roundName-testid"), {
        target: { value: "testinground" },
      });

      /* Applicactions start date */
      fireEvent.change(appStartDateInput, {
        target: { value: "08/25/2022 12:00 AM" },
      });

      /* Applications end date */
      fireEvent.change(appEndDateInput, {
        target: { value: "08/24/2022 12:00 AM" },
      });

      /* Click next button */
      fireEvent.click(screen.getByRole("button", { name: /next|launch/i }));

    });
      
    // fails to move to next step
    expect(appEndDateInput).toBeInTheDocument();

  });

  it("validates round end date is after round start date", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const roundStartDateInput = screen.getByTestId("roundVotingStartTime-testid");
    const roundEndDateInput = screen.getByTestId("roundVotingEndTime-testid");

    await act(async () => {
      /* Prefill round name to ignore errors from it */
      fireEvent.input(screen.getByTestId("roundName-testid"), {
        target: { value: "testinground" },
      });

      /* Round start date */
      fireEvent.change(roundStartDateInput, {
        target: { value: "08/25/2022 12:00 AM" },
      });

      /* Round end date */
      fireEvent.change(roundEndDateInput, {
        target: { value: "08/24/2022 12:00 AM" },
      });

      /* Trigger validation */
      fireEvent.click(screen.getByText("Launch"));
    });

    // expect screen to remain on same page
    expect(screen.getByTestId("roundVotingStartTime-testid")).toBeInTheDocument();

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

    const appStartDateInput = screen.getByTestId("roundApplicationsStartTime-testid");
    const appEndDateInput = screen.getByTestId("roundApplicationsEndTime-testid");
    const roundStartDateInput = screen.getByTestId("roundVotingStartTime-testid");
    const roundEndDateInput = screen.getByTestId("roundVotingEndTime-testid");

    /* Round Name */
    fireEvent.input(screen.getByTestId("roundName-testid"), {
      target: { value: "testinground" },
    });

    /* Support Selection */
    const supportSelection = screen.getByTestId("roundSupport.type-testid");
    fireEvent.click(supportSelection);
    const emailSupportOption = screen.getByTestId("roundSupport.type-option-Email");
    fireEvent.click(emailSupportOption);

    /* Contact Information */
    fireEvent.input(screen.getByLabelText("Contact Information"), {
      target: { value: "johndoe@example.com" },
    });

    /* Applications start date */
    fireEvent.change(appStartDateInput, {
      target: {
        value: moment(applicationsStartTime).format('YYYY-MM-DDTHH:mm'),
      },
    });

    /* Applications end date */
    fireEvent.change(appEndDateInput, {
      target: {
        value: moment(applicationsEndTime).format('YYYY-MM-DDTHH:mm'),
      },
    });

    /* Round start date */
    fireEvent.change(roundStartDateInput, {
      target: { value: moment(roundStartTime).format('YYYY-MM-DDTHH:mm') },
    });

    /* Round end date */
    fireEvent.change(roundEndDateInput, {
      target: { value: moment(roundEndTime).format('YYYY-MM-DDTHH:mm') },
    });

    /* Round Type Selection */
    const roundTypeOption = screen.getByTestId("round-type-public");
    fireEvent.click(roundTypeOption);

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
});
