import { FormStepper } from "../common/FormStepper";
import { useContext } from "react";
import { FormContext } from "../common/FormWizard";
import { SubmitHandler, useForm } from "react-hook-form";
import { Round } from "../api/types";

interface ApplicationEligibilityFormProps {
  stepper: typeof FormStepper;
}

export default function ApplicationEligibilityForm(
  props: ApplicationEligibilityFormProps
) {
  const { currentStep, setCurrentStep, stepsCount, formData, setFormData } =
    useContext(FormContext);
  const { handleSubmit } = useForm<Round>({
    defaultValues: formData,
  });
  const FormStepper = props.stepper;

  const next: SubmitHandler<Round> = async (values) => {
    const data = { ...formData, ...values };
    setFormData(data);
    setCurrentStep(currentStep + 1);
  };
  const prev = () => setCurrentStep(currentStep - 1);

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-10">
        <div className="md:col-span-1">
          <p className="text-base leading-6">Round Eligibility</p>
          <p
            className="mt-1 text-sm text-grey-400"
            data-testid="round-eligibility-helper-copy"
          >
            Describe the round to applicants and let them know the eligibility
            requirements.
          </p>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="px-6 align-middle py-3.5 shadow-md">
            <form
              onSubmit={handleSubmit(next)}
              className="shadow-sm text-grey-500"
            >
              <FormStepper
                currentStep={currentStep}
                stepsCount={stepsCount}
                prev={prev}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
