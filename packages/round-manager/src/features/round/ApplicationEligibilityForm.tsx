import { FormStepper } from "../common/FormStepper";
import { useContext } from "react";
import { FormContext } from "../common/FormWizard";
import {
  FieldArrayMethodProps,
  FieldArrayWithId,
  FieldError,
  SubmitHandler,
  useFieldArray,
  useForm,
  UseFormRegister,
  UseFormRegisterReturn,
} from "react-hook-form";
import { Round } from "../api/types";
import { Button, Input } from "common/src/styles";
import { PlusSmIcon } from "@heroicons/react/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface ApplicationEligibilityFormProps {
  stepper: typeof FormStepper;
}

const ValidationSchema = yup.object().shape({
  roundMetadata: yup.object({
    eligibility: yup.object({
      description: yup.string().required("This field is required."),
    }),
  }),
});

export default function ApplicationEligibilityForm(
  props: ApplicationEligibilityFormProps
) {
  const { currentStep, setCurrentStep, stepsCount, formData, setFormData } =
    useContext(FormContext);
  const initialRoundMetadata: Round["roundMetadata"] =
    // @ts-expect-error Needs refactoring/typing as a whole
    formData?.roundMetadata ?? {};
  const defaultEligibilityFormData: Round["roundMetadata"]["eligibility"] =
    initialRoundMetadata?.eligibility ?? {
      description: "",
      requirements: [{ requirement: "" }], // NB: start with 1 requirement
    };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Round>({
    defaultValues: {
      ...formData,
      roundMetadata: {
        ...initialRoundMetadata,
        eligibility: defaultEligibilityFormData,
      },
    },
    resolver: yupResolver(ValidationSchema),
  });

  const { fields, append } = useFieldArray({
    name: "roundMetadata.eligibility.requirements",
    control,
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
        <LeftSidebar />

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form
            onSubmit={handleSubmit(next)}
            className="shadow-sm text-grey-500"
          >
            <div className="pt-7 pb-10 sm:px-6 bg-white">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <RoundInput
                    register={register("roundMetadata.eligibility.description")}
                    error={errors.roundMetadata?.eligibility?.description}
                    labelText={"Round Description"}
                    inputId={"eligibility.description"}
                    inputPlaceholder={
                      "Enter a short description of your round."
                    }
                  />

                  <DynamicRequirementsForm
                    fields={fields}
                    register={register}
                    append={append}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 align-middle py-3.5 shadow-md">
              <FormStepper
                currentStep={currentStep}
                stepsCount={stepsCount}
                prev={prev}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LeftSidebar() {
  return (
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
  );
}

function RoundInput(props: {
  inputId: string;
  register: UseFormRegisterReturn<string>;
  error?: FieldError;
  labelText: string;
  inputPlaceholder?: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex justify-between">
        <label htmlFor={props.inputId} className="block text-sm">
          {props.labelText}
        </label>
        <span className="text-xs text-violet-400">*Required</span>
      </div>
      <Input
        {...props.register}
        type="text"
        id={props.inputId}
        placeholder={props.inputPlaceholder}
        $hasError={Boolean(props.error)}
      />
      {props.error && (
        <p className="text-xs text-pink-500" data-testid="error-message">
          {props.error.message}
        </p>
      )}
    </div>
  );
}

function DynamicRequirementsForm(props: {
  fields: FieldArrayWithId<Round, "roundMetadata.eligibility.requirements">[];
  register: UseFormRegister<Round>;
  append: (
    newRequirement: { requirement: string },
    options?: FieldArrayMethodProps
  ) => void;
}) {
  const { fields, register, append } = props;
  return (
    <div>
      <p className="text-grey-400 mb-6">
        What requirements do you have for applicants?
      </p>
      <ul>
        {fields.map((item, index) => (
          <li key={item.id} className="mb-4">
            <div className="flex justify-between">
              <label
                htmlFor={`Requirement ${index + 1}`}
                className="block text-sm"
              >
                {`Requirement ${index + 1}`}
              </label>
              <span className="text-xs text-grey-400">Optional</span>
            </div>
            <Input
              {...register(
                `roundMetadata.eligibility.requirements.${index}.requirement`
              )}
              type="text"
              placeholder="Enter an eligibility requirement."
              data-testid="requirement-input"
            />
          </li>
        ))}
      </ul>
      <Button
        type="button"
        $variant="outline"
        className="inline-flex items-center px-3.5 py-2 border-none shadow-sm text-sm rounded text-violet-500 bg-violet-100"
        onClick={() => {
          append({ requirement: "" });
        }}
      >
        <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
        Add A Requirement
      </Button>
    </div>
  );
}
