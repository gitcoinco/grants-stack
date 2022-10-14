import { render, screen } from "@testing-library/react";
import ApplicationEligibilityForm from "../ApplicationEligibilityForm";
import { FormStepper } from "../../common/FormStepper";
import { FormContext } from "../../common/FormWizard";

describe("<ApplicationEligibilityForm>", () => {
  it("should show the page title", () => {
    render(<ApplicationEligibilityForm stepper={FormStepper} />);

    expect(screen.getByText("Round Eligibility")).toBeInTheDocument();
  });

  it("should show the helper copy", () => {
    render(<ApplicationEligibilityForm stepper={FormStepper} />);

    expect(
      screen.getByTestId("round-eligibility-helper-copy")
    ).toBeInTheDocument();
  });

  it("should show the next button when ApplicationEligibilityForm is the second step out of three", () => {
    render(
      <FormContext.Provider
        value={{
          currentStep: 2,
          setCurrentStep: jest.fn(),
          stepsCount: 3,
          formData: {},
          setFormData: jest.fn(),
        }}
      >
        <ApplicationEligibilityForm stepper={FormStepper} />
      </FormContext.Provider>
    );

    const nextButton = screen.getByRole("button", {
      name: /Next/i,
    });
    expect(nextButton).toBeInTheDocument();
  });
});
