import { screen } from "@testing-library/react";
import { renderWrapped } from "../../../test-utils";
import ProgressModal, { Step } from "../ProgressModal";
import { ProgressStatus } from "../../api/types";

const completedStep = {
  name: "My Todo List",
  description: "Done :)",
  status: ProgressStatus.IS_SUCCESS,
};
const currentStep = {
  name: "My Current Step",
  description: "Work in progress",
  status: ProgressStatus.IN_PROGRESS,
};
const errorStep = {
  name: "Oh no!",
  description: "Something went wrong :(",
  status: ProgressStatus.IS_ERROR,
};
const upcomingStep = {
  name: "My Weekend Plan",
  description: "To be completed in the future",
  status: ProgressStatus.NOT_STARTED,
};

const steps = [completedStep, currentStep, errorStep, upcomingStep];

describe("<ProgressModal />", () => {
  describe("error status styling", () => {
    it('shows "error" style for the step when the step status is error', () => {
      renderWrapped(<ProgressModal isOpen steps={steps} />);

      screen.getByTestId(`${errorStep.name}-error-icon`);
    });

    it.each([completedStep, currentStep, upcomingStep])(
      'does not show "error" icon for a step with status $status',
      (nonMatchingStep: Step) => {
        renderWrapped(<ProgressModal isOpen steps={steps} />);

        expect(
          screen.queryByTestId(`${nonMatchingStep.name}-error-icon`)
        ).not.toBeInTheDocument();
      }
    );
  });

  describe("current status styling", () => {
    it('shows the "current" style for the step when the step status is current', () => {
      renderWrapped(<ProgressModal isOpen steps={steps} />);

      const name = screen.getByText(currentStep.name);
      expect(name.className.includes("violet")).toBe(true);

      const description = screen.getByText(currentStep.description);
      expect(description.className.includes("grey-400")).toBe(true);

      const icon = screen.getByTestId(`${currentStep.name}-current-icon`);
      expect(icon.className.includes("violet")).toBe(true);
    });

    it.each([completedStep, errorStep, upcomingStep])(
      'does not show "current" icon for a step with status $status',
      (nonMatchingStep: Step) => {
        renderWrapped(<ProgressModal isOpen steps={steps} />);

        expect(
          screen.queryByTestId(`${nonMatchingStep.name}-current-icon`)
        ).not.toBeInTheDocument();
      }
    );
  });

  describe("upcoming status styling", () => {
    it('shows the "upcoming" style when the state is upcoming', () => {
      renderWrapped(<ProgressModal isOpen steps={steps} />);

      const name = screen.getByText(upcomingStep.name);
      expect(name.className.includes("grey-400")).toBe(true);

      const description = screen.getByText(upcomingStep.description);
      expect(description.className.includes("grey-400")).toBe(true);

      const icon = screen.getByTestId(`${upcomingStep.name}-upcoming-icon`);
      expect(icon.className.includes("grey-400")).toBe(true);
    });

    it.each([currentStep, errorStep, completedStep])(
      'does not show "upcoming" icon for a step with status $status',
      (nonMatchingStep: Step) => {
        renderWrapped(<ProgressModal isOpen steps={steps} />);

        expect(
          screen.queryByTestId(`${nonMatchingStep.name}-upcoming-icon`)
        ).not.toBeInTheDocument();
      }
    );
  });

  describe("complete status styling", () => {
    it('shows the "complete" style for the step when the step status is complete', () => {
      renderWrapped(<ProgressModal isOpen steps={steps} />);

      const name = screen.getByText(completedStep.name);
      expect(name.className.includes("grey-500")).toBe(true);

      const description = screen.getByText(completedStep.description);
      expect(description.className.includes("grey-500")).toBe(true);

      const icon = screen.getByTestId(`${completedStep.name}-complete-icon`);
      expect(icon.className.includes("teal")).toBe(true);
    });

    it.each([currentStep, errorStep, upcomingStep])(
      'does not show "complete" icon for a step with status $status',
      (nonMatchingStep: Step) => {
        renderWrapped(<ProgressModal isOpen steps={steps} />);

        expect(
          screen.queryByTestId(`${nonMatchingStep.name}-complete-icon`)
        ).not.toBeInTheDocument();
      }
    );
  });

  it("should render children", () => {
    const expectedTestId = `child-test-id-123`;
    const child = <div data-testid={expectedTestId} />;
    renderWrapped(
      <ProgressModal isOpen steps={steps}>
        {child}
      </ProgressModal>
    );

    expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
  });
});
