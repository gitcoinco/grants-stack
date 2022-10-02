import { renderWrapped } from "../../../test-utils";
import { FormStepper, FormStepperProps } from "../FormStepper";
import { fireEvent, screen } from "@testing-library/react";
import { faker } from "@faker-js/faker";

describe("<FormStepper />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when currentStep is past the first step", () => {
    const stepsCount = faker.datatype.number({ min: 2 });
    const currentStep = faker.datatype.number({ min: 2, max: stepsCount });

    it("should display a Previous button when currentStep > 1", () => {
      const testFormStepperProps: FormStepperProps = {
        currentStep,
        stepsCount,
        disableNext: false,
        prev: jest.fn(),
      };

      renderWrapped(<FormStepper {...testFormStepperProps} />);

      expect(screen.getByText(/Previous/i)).toBeInTheDocument();
    });

    it("should call prev fn when Previous button is clicked", () => {
      const mockPrevFn = jest.fn();
      const testFormStepperProps: FormStepperProps = {
        currentStep,
        stepsCount,
        disableNext: false,
        prev: mockPrevFn,
      };

      renderWrapped(<FormStepper {...testFormStepperProps} />);

      const previousButton = screen.getByText(/Previous/i);
      fireEvent.click(previousButton);
      expect(mockPrevFn).toBeCalledTimes(1);
    });
  });

  describe("when currentStep is not the last step", () => {
    const stepsCount = faker.datatype.number({ min: 2 });
    const currentStep = faker.datatype.number({ min: 1, max: stepsCount - 1 });
    const testFormStepperProps: FormStepperProps = {
      currentStep,
      stepsCount,
      disableNext: false,
      prev: jest.fn(),
    };

    it("should display a Next button", () => {
      renderWrapped(<FormStepper {...testFormStepperProps} />);

      expect(screen.getByText(/Next/i)).toBeInTheDocument();
    });

    it("should display Next button as disabled when disableNext is true", () => {
      const disableNextProps: FormStepperProps = {
        ...testFormStepperProps,
        disableNext: true,
      };

      renderWrapped(<FormStepper {...disableNextProps} />);

      const nextButton = screen.getByText(/Next/i);
      expect(nextButton).toBeDisabled();
    });
  });

  describe("when currentStep is the last step", () => {
    const stepsCount = faker.datatype.number({ min: 1 });
    const currentStep = stepsCount;
    const testFormStepperProps: FormStepperProps = {
      currentStep,
      stepsCount,
      disableNext: false,
      prev: jest.fn(),
    };

    it("should display a Launch button instead of Next", () => {
      renderWrapped(<FormStepper {...testFormStepperProps} />);

      expect(screen.getByText(/Launch/i)).toBeInTheDocument();
      expect(screen.queryByText(/Next/i)).not.toBeInTheDocument();
    });

    it("should display Launch button as disabled when disableNext is true", () => {
      const disableNextProps: FormStepperProps = {
        ...testFormStepperProps,
        disableNext: true,
      };

      renderWrapped(<FormStepper {...disableNextProps} />);

      const launchButton = screen.getByText(/Launch/i);
      expect(launchButton).toBeDisabled();
    });
  });
});
