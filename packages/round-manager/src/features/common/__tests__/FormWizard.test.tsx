/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { FormWizard } from "../FormWizard";
import { randomInt } from "crypto";

const generateSteps = (
  numberOfSteps?: number
): Array<(props: any) => JSX.Element> =>
  Array.from(
    { length: numberOfSteps || randomInt(1, 20) },
    (_, index) => () => <div data-testid={`${index + 1}-step`} /> // 1-indexed to match initialCurrentStep convention
  );

describe("<FormWizard />", () => {
  it("should render the first step by default", () => {
    const steps = generateSteps();

    render(<FormWizard steps={steps} />);

    expect(screen.getByTestId("1-step")).toBeInTheDocument();
    expect(screen.queryByTestId("2-step")).not.toBeInTheDocument();
  });

  it("should render the initialCurrentStep step instead of the first step", () => {
    const steps = generateSteps(10);
    const notTheFirstStep = randomInt(2, 10); // 1-indexed

    render(<FormWizard initialCurrentStep={notTheFirstStep} steps={steps} />);

    expect(screen.queryByTestId("1-step")).not.toBeInTheDocument();
    expect(screen.getByTestId(`${notTheFirstStep}-step`)).toBeInTheDocument();
  });
});
