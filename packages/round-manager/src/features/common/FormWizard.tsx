import { createContext, useState } from "react";
import { FormStepper } from "./FormStepper";
import { RoundCategory } from "common/dist/types";

export interface FormWizardProps {
  initialCurrentStep?: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  initialData?: object;
  configuration?: { roundCategory?: RoundCategory };
  steps: Array<
    // eslint-disable-next-line @typescript-eslint/ban-types
    (props: {
      stepper: typeof FormStepper;
      initialData: object;
      configuration: object;
    }) => JSX.Element
  >;
}

export type FormContextType = {
  currentStep: number;
  setCurrentStep: (value: number) => void;
  stepsCount: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  formData: object;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setFormData: (value: object) => void;
};

export const FormContext = createContext<FormContextType>(
  {} as unknown as FormContextType
);

export function FormWizard({
  initialCurrentStep = 1,
  initialData = {},
  configuration = {},
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
      <Content
        stepper={FormStepper}
        initialData={initialData}
        configuration={configuration}
      />
    </FormContext.Provider>
  );
}
