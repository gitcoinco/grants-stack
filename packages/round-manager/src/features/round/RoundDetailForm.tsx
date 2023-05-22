import { useContext, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import "react-datetime/css/react-datetime.css";
import {
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Program, Round } from "../api/types";
import { FormStepper } from "../common/FormStepper";
import { FormContext } from "../common/FormWizard";
import _ from "lodash";
import { applicationValidationSchema as ValidationSchema } from "./applicationValidationSchema";
import { RoundName, ProgramChain, ContactInformation, Datetime, RoundType, Support } from "./ApplicationFormComponents";
import moment from "moment";

interface RoundDetailFormProps {
  stepper: typeof FormStepper;
  initialData?: { program?: Program };
}

export function RoundDetailForm(props: RoundDetailFormProps) {
  const program = props.initialData?.program;
  const { currentStep, setCurrentStep, stepsCount, formData, setFormData } =
  useContext(FormContext);
  const defaultRoundMetadata = {
    ...((formData as Partial<Round>)?.roundMetadata ?? {}),
    feesPercentage: 0,
    feesAddress: "",
  };
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Round>({
    defaultValues: {
      ...formData,
      roundMetadata: defaultRoundMetadata,
    },
    resolver: yupResolver(ValidationSchema),
  });

  const FormStepper = props.stepper;
  const [applicationStartDate, setApplicationStartDate] = useState<moment.Moment>();
  const [applicationEndDate, setApplicationEndDate] = useState<moment.Moment>();
  const [roundStartDate, setRoundStartDate] = useState<moment.Moment>();

  const next: SubmitHandler<Round> = async (values) => {
    const data = _.merge(formData, values);
    setFormData(data);
    setCurrentStep(currentStep + 1);
  };

  const prev = () => setCurrentStep(currentStep - 1);

  const now = moment(); 

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-10">
        <div className="md:col-span-1">
          <p className="text-base leading-6">Round Details</p>
          <p className="mt-1 text-sm text-grey-400">
            What is the Round name, when do applications open/close, and when
            does it start and end?
          </p>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form
            data-testid={"roundDetailForm"}
            onSubmit={handleSubmit(next)}
            className="shadow-sm text-grey-500"
          >
            <div className="pt-7 sm:px-6 bg-white">
              <div className="grid grid-cols-6 gap-6">
                <RoundName
                  register={register("roundMetadata.name")}
                  errors={errors}
                />
                {program && <ProgramChain program={program} />}
              </div>

              <p className="mt-6 mb-4 text-sm">
                Where can applicants reach you and/or your team if support is
                needed?
              </p>
              <div className="grid grid-cols-6 gap-6 mb-1">
                <div className="col-span-6 sm:col-span-3">
                  <Support
                    register={register("roundMetadata.support.type")}
                    errors={errors}
                    control={control}
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 pt-2">
                  <ContactInformation
                    register={register("roundMetadata.support.info")}
                    errors={errors}
                  />
                </div>
              </div>

              <div className="mt-6 mb-4 text-sm">
                <span>
                  What are the dates for the Applications and Round voting
                  period(s)?
                </span>
              </div>

              <p className="text-sm mb-2">
                <span>Applications</span>
                <span className="text-right text-violet-400 float-right text-xs mt-1">
                  *Required
                </span>
              </p>
              <div className="grid grid-cols-6 gap-6 mb-1">
                <div className="col-span-6 sm:col-span-3">
                  <div
                    className={`relative border rounded-md px-3 py-2 mb-2 shadow-sm focus-within:ring-1 ${
errors.applicationsStartTime
? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
: "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
}`}
                  >
                    <Datetime
                      control={control}
                      name="applicationsStartTime"
                      label="Start Date"
                      date={applicationStartDate}
                      setDate={setApplicationStartDate}
                      minDate={now}
                    />
                  </div>
                  {errors.applicationsStartTime && (
                    <p
                      className="text-xs text-pink-500"
                      data-testid="application-start-date-error"
                    >
                      {errors.applicationsStartTime?.message}
                    </p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <div
                    className={`relative border rounded-md px-3 py-2 mb-2 shadow-sm focus-within:ring-1 ${
errors.applicationsEndTime
? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
: "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
}`}
                  >
                    <Datetime 
                      control={control}
                      name="applicationsEndTime"
                      label="End Date"
                      date={applicationEndDate}
                      setDate={setApplicationEndDate}
                      minDate={applicationStartDate}
                    />
                  </div>
                  {errors.applicationsEndTime && (
                    <p
                      className="text-xs text-pink-500"
                      data-testid="application-end-date-error"
                    >
                      {errors.applicationsEndTime?.message}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm mt-4 mb-2">
                Round
                <span className="text-right text-violet-400 float-right text-xs mt-1">
                  *Required
                </span>
              </p>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <div
                    className={`relative border rounded-md px-3 py-2 mb-2 shadow-sm focus-within:ring-1 ${
errors.roundStartTime
? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
: "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
}`}
                  >
                    <Datetime
                      control={control}
                      name="roundStartTime"
                      label="Start Date"
                      date={roundStartDate}
                      setDate={setRoundStartDate}
                      minDate={applicationEndDate}
                    />
                  </div>
                  {errors.roundStartTime && (
                    <p
                      className="text-xs text-pink-500"
                      data-testid="round-start-date-error"
                    >
                      {errors.roundStartTime?.message}
                    </p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <div
                    className={`relative border rounded-md px-3 py-2 mb-2 shadow-sm focus-within:ring-1 ${
errors.roundEndTime
? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
: "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
}`}
                  >
                    <Datetime 
                      control={control}
                      name="roundEndTime"
                      label="End Date"
                      minDate={roundStartDate}
                    />
                  </div>
                  {errors.roundEndTime && (
                    <p
                      className="text-xs text-pink-500"
                      data-testid="round-end-date-error"
                    >
                      {errors.roundEndTime?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white">
              <div className="grid grid-rows-1">
                <p>
                  Do you want to show your round on the Gitcoin Explorer
                  homepage?
                </p>
              </div>
              <div className="flex mt-4">
                <RoundType
                  register={register("roundMetadata.roundType")}
                  control={control}
                />
              </div>
              {errors.roundMetadata?.roundType && (
                <p
                  className="text-xs text-pink-500 mt-2"
                  data-testid="round-end-date-error"
                >
                  {errors.roundMetadata?.roundType?.message}
                </p>
              )}
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
