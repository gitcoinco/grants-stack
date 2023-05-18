import { faker } from "@faker-js/faker";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Round } from "../../api/types";
import { FormStepper } from "../../common/FormStepper";
import { FormContext } from "../../common/FormWizard";
import ApplicationEligibilityForm from "../ApplicationEligibilityForm";

describe("<ApplicationEligibilityForm>", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  describe("form fields", () => {
    it("should display an input field for round description", () => {
      render(<ApplicationEligibilityForm stepper={FormStepper} />);

      expect(screen.getByLabelText("Round Description")).toBeInTheDocument();
    });

    it("should display an input field for Requirement 1 to start with", () => {
      render(<ApplicationEligibilityForm stepper={FormStepper} />);

      // NB: getByLabelText does not work here for unknown reason
      expect(screen.getByText("Requirement 1")).toBeInTheDocument();
    });

    it("should display an Add a Requirement button", () => {
      render(<ApplicationEligibilityForm stepper={FormStepper} />);

      expect(
        screen.getByRole("button", {
          name: /Add a Requirement/i,
        })
      ).toBeInTheDocument();
    });

    it("selecting Add a Requirement adds an additional requirement input field", async () => {
      render(<ApplicationEligibilityForm stepper={FormStepper} />);
      const initialRequirementInputFields = await screen.findAllByTestId(
        "requirement-input"
      );

      const addARequirement = screen.getByRole("button", {
        name: /Add a Requirement/i,
      });
      fireEvent.click(addARequirement);

      const requirementInputFields = await screen.findAllByTestId(
        "requirement-input"
      );
      expect(requirementInputFields).toHaveLength(
        initialRequirementInputFields.length + 1
      );
    });

    it("selecting X removes a requirement input field", async () => {
      render(<ApplicationEligibilityForm stepper={FormStepper} />);
      const initialRequirementInputFields = await screen.findAllByTestId(
        "requirement-input"
      );

      const addARequirement = screen.getByRole("button", {
        name: /Add a Requirement/i,
      });
      fireEvent.click(addARequirement);

      const requirementInputFields = await screen.findAllByTestId(
        "requirement-input"
      );
      expect(requirementInputFields).toHaveLength(
        initialRequirementInputFields.length + 1
      );

      const removeRequirementButtons = await screen.findAllByTestId(
        "remove-requirement-button"
      );
      expect(requirementInputFields).toHaveLength(
        initialRequirementInputFields.length + 1
      );

      fireEvent.click(removeRequirementButtons[0]);

      const updatedRequirementInputFields = await screen.findAllByTestId(
        "requirement-input"
      );
      expect(updatedRequirementInputFields).toHaveLength(
        initialRequirementInputFields.length
      );
    });
  });
});

describe("form submission", () => {
  const setFormData = jest.fn();
  let formContext: any;
  beforeEach(() => {
    jest.clearAllMocks();

    formContext = {
      currentStep: 2,
      setCurrentStep: jest.fn(),
      stepsCount: 3,
      formData: {},
      setFormData,
    };
  });

  it("should set form data with user input when form is submitted", async () => {
    const expectedDescription = faker.lorem.sentence();
    const expectedRequirement = faker.lorem.sentence();
    const expectedEligibilityFormData: Round["roundMetadata"]["eligibility"] = {
      description: expectedDescription,
      requirements: [{ requirement: expectedRequirement }],
    };

    render(
      <FormContext.Provider value={formContext}>
        <ApplicationEligibilityForm stepper={FormStepper} />
      </FormContext.Provider>
    );
    fireEvent.input(screen.getByLabelText("Round Description"), {
      target: { value: expectedDescription },
    });
    fireEvent.input(screen.getByTestId("requirement-input"), {
      target: { value: expectedRequirement },
    });
    const submit = screen.getByRole("button", {
      name: /Next/i,
    });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(setFormData).toBeCalled();
    });
    expect(setFormData).toBeCalledWith({
      roundMetadata: {
        eligibility: expectedEligibilityFormData,
      },
    });
  });

  it("should set form data with multiple requirements when form is submitted", async () => {
    const expectedDescription = faker.lorem.sentence();
    const expectedEligibilityFormData: Round["roundMetadata"]["eligibility"] = {
      description: expectedDescription,
      requirements: [
        { requirement: "" },
        { requirement: "" },
        { requirement: "" },
      ],
    };

    render(
      <FormContext.Provider value={formContext}>
        <ApplicationEligibilityForm stepper={FormStepper} />
      </FormContext.Provider>
    );
    fireEvent.input(screen.getByLabelText("Round Description"), {
      target: { value: expectedDescription },
    });
    const addARequirement = screen.getByRole("button", {
      name: /Add a Requirement/i,
    });
    fireEvent.click(addARequirement);
    fireEvent.click(addARequirement);
    const submit = screen.getByRole("button", {
      name: /Next/i,
    });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(setFormData).toBeCalled();
    });
    expect(setFormData).toBeCalledWith({
      roundMetadata: {
        eligibility: expectedEligibilityFormData,
      },
    });
  });

  it("should show an error when no user input in required description field", async () => {
    render(
      <FormContext.Provider value={formContext}>
        <ApplicationEligibilityForm stepper={FormStepper} />
      </FormContext.Provider>
    );

    const submit = screen.getByRole("button", {
      name: /Next/i,
    });
    await act(async () => {
      fireEvent.click(submit);
    });

    expect(await screen.findByTestId("error-message")).toBeInTheDocument();
  });
});
