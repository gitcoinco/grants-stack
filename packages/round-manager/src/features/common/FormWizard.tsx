import { createContext, useState } from "react";

import { FormStepper } from "./FormStepper";

export interface FormWizardProps {
  initialCurrentStep?: number;
  initialData?: object;
  steps: Array<(props: any) => JSX.Element>;
}

export const FormContext = createContext({} as any);

export function FormWizard({
  initialCurrentStep = 1,
  initialData = {},
  steps,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialCurrentStep);
  const [formData, setFormData] = useState({});

  const Content = steps[currentStep - 1];

  return (
    <FormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        stepsCount: steps.length,
        formData,
        setFormData,
      }}
    >
      <Content stepper={FormStepper} initialData={initialData} />
    </FormContext.Provider>
  );
}
