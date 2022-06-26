import { createContext, useState } from "react"

import { Button } from "./styles"

export interface FormWizardProps {
  initialCurrentStep?: number,
  steps: Array<() => JSX.Element>,
}

export const FormContext = createContext({})

export default function FormWizard({ initialCurrentStep = 1, steps }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialCurrentStep)
  const [formData, setFormData] = useState({})
  const [canSubmit, setCanSubmit] = useState(false)

  const Content = steps[currentStep - 1]

  const next = () => setCanSubmit(true)
  const prev = () => setCurrentStep(currentStep - 1)

  return (
    <FormContext.Provider
      value={{
        steps,
        canSubmit,
        currentStep, setCurrentStep,
        formData, setFormData,
        totalSteps: steps.length,
      }}
    >
      <div className="border border-grey-100 px-6 pt-6 pb-3.5">
        <Content />

        <div className="space-x-4 mt-6">
          {currentStep > 1 && <Button $variant="outline" onClick={prev}>Previous</Button>}
          <Button $variant="solid" onClick={next}>{currentStep === steps.length ? "Deploy" : "Next"}</Button>
        </div>
      </div>
    </FormContext.Provider>
  )
}
