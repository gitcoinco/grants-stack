import { render, screen } from "@testing-library/react"
import { FormWizard } from "../FormWizard"
import { randomInt } from "crypto"
import { FormStepper } from "../FormStepper"

const generateSteps = (numberOfSteps?: number): Array<(props: any) => JSX.Element> => (
  Array.from(
    {length: numberOfSteps || randomInt(1, 20)},
    (_, index) => (
      () => <div data-testid={`${index + 1}-step`}/> // 1-indexed to match initialCurrentStep convention
    ),
  )
)

describe("<FormWizard />", () => {
  it("should render the first step by default", () => {
    const steps = generateSteps()

    render(<FormWizard steps={steps}/>)

    expect(screen.getByTestId("1-step")).toBeInTheDocument()
    expect(screen.queryByTestId("2-step")).not.toBeInTheDocument()
  })

  it("should render the initialCurrentStep step instead of the first step", () => {
    const steps = generateSteps(10)
    const initialCurrentStep = randomInt(2, 10) // 1-indexed, picking a random step after the 1st one

    render(<FormWizard initialCurrentStep={initialCurrentStep} steps={steps}/>)

    expect(screen.queryByTestId("1-step")).not.toBeInTheDocument()
    expect(screen.getByTestId(`${initialCurrentStep}-step`)).toBeInTheDocument()
  })

  it("should pass down stepper and initialData props to child step", () => {
    const mockChildComponent = jest.fn().mockImplementation(() => <div />)
    const steps = [
      mockChildComponent
    ]
    const initialData = {hello: "world"}

    render(<FormWizard steps={steps} initialData={initialData}/>)

    const mockChildComponentCall = mockChildComponent.mock.calls[0]
    const firstCallArgument = mockChildComponentCall[0]
    expect(firstCallArgument).toMatchObject({
      stepper: FormStepper,
      initialData
    })
  })
})