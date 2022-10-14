/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, fireEvent, screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";

import { FormStepper } from "../../common/FormStepper";
import { RoundDetailForm } from "../RoundDetailForm";
import { FormContext } from "../../common/FormWizard";

jest.mock("../../common/Auth");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

describe("<RoundDetailForm />", () => {
  it("renders round name input", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const roundNameInput = await screen.getByLabelText("Round Name");
    expect(roundNameInput).toBeInTheDocument();
  });

  it("requires round name input to not be empty", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const submitButton = await screen.getByRole("button");
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
    const submitButton = await screen.getByRole("button");
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
    const nextButton = await screen.getByRole("button");
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

  it("validates round start time is after application start time", async () => {
    renderWrapped(<RoundDetailForm stepper={FormStepper} />);
    const startDateInputs = await screen.getAllByLabelText("Start Date");

    await act(async () => {
      /* Prefill round name to ignore errors from it */
      fireEvent.input(screen.getByLabelText("Round Name"), {
        target: { value: "testinground" },
      });

      /* Applicactions start date*/
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

    await act(async () => {
      /* Prefill round name to ignore errors from it */
      fireEvent.input(screen.getByLabelText("Round Name"), {
        target: { value: "testinground" },
      });

      /* Applications start date */
      expect(startDateInputs[0].id).toBe("applicationsStartTime");
      fireEvent.change(startDateInputs[0], {
        target: { value: "08/20/2022 12:00 AM" },
      });

      /* Applications end date */
      expect(endDateInputs[0].id).toBe("applicationsEndTime");
      fireEvent.change(endDateInputs[0], {
        target: { value: "08/21/2022 12:00 AM" },
      });

      /* Round start date */
      expect(startDateInputs[1].id).toBe("roundStartTime");
      fireEvent.change(startDateInputs[1], {
        target: { value: "08/22/2022 12:00 AM" },
      });

      /* Round end date */
      expect(endDateInputs[1].id).toBe("roundEndTime");
      fireEvent.change(endDateInputs[1], {
        target: { value: "08/23/2022 12:00 AM" },
      });

      /* Trigger validation */
      fireEvent.click(screen.getByText("Next"));
    });

    expect(setCurrentStep).toHaveBeenCalledWith(1);
    expect(setFormData).toHaveBeenCalledTimes(1);
  });
});
