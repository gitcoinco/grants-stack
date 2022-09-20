import { useContext } from "react";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Round } from "../api/types";
import { FormContext } from "../common/FormWizard";
import { Input } from "../common/styles";
import { FormStepper } from "../common/FormStepper";

const ValidationSchema = yup.object().shape({
  roundMetadata: yup.object({
    name: yup
      .string()
      .required("This field is required.")
      .min(8, "Round name must at least 8 characters."),
  }),
  applicationsStartTime: yup.date().required("This field is required."),
  roundStartTime: yup
    .date()
    .required("This field is required.")
    .min(
      yup.ref("applicationsStartTime"),
      "Round start date must be later than application start date"
    ),
  roundEndTime: yup
    .date()
    .min(
      yup.ref("roundStartTime"),
      "Round end date must be later than the round start date"
    ),
});

interface RoundDetailFormProps {
  stepper: typeof FormStepper;
}

export function RoundDetailForm(props: RoundDetailFormProps) {
  const { currentStep, setCurrentStep, stepsCount, formData, setFormData } =
    useContext(FormContext);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Round>({
    defaultValues: formData,
    resolver: yupResolver(ValidationSchema),
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
          <p className="text-base leading-6">Details</p>
          <p className="mt-1 text-sm text-grey-400">
            Use a permanent address where you can receive mail.
          </p>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form
            onSubmit={handleSubmit(next)}
            className="shadow-sm text-grey-500"
          >
            <div className="pt-7 pb-10 sm:px-6 bg-white">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="name" className="block text-xs font-medium">
                    Round Name
                  </label>
                  <Input
                    {...register("roundMetadata.name")}
                    $hasError={errors.roundMetadata?.name}
                    type="text"
                  />
                  {errors.roundMetadata?.name && (
                    <p className="text-xs text-pink-500">
                      {errors.roundMetadata?.name?.message}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-6">
                What are the dates for the Applications and Round voting
                period(s)
              </p>

              <p className="text-xs mt-4 mb-2">Applications</p>
              <div className="grid grid-cols-6 gap-6 mb-1">
                <div className="col-span-6 sm:col-span-3">
                  <div
                    className={`relative border rounded-md px-3 py-2 mb-2 shadow-sm focus-within:ring-1 ${
                      errors.applicationsStartTime
                        ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                        : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                    }`}
                  >
                    <label
                      htmlFor="applicationsStartTime"
                      className="block text-[10px]"
                    >
                      Start Date
                    </label>
                    <Controller
                      control={control}
                      name="applicationsStartTime"
                      render={({ field }) => (
                        <Datetime
                          {...field}
                          closeOnSelect
                          inputProps={{
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                          }}
                        />
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.applicationsStartTime && (
                    <p className="text-xs text-pink-500">
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
                    <label
                      htmlFor="applicationsEndTime"
                      className="block text-[10px]"
                    >
                      End Date
                    </label>
                    <Controller
                      control={control}
                      name="applicationsEndTime"
                      render={({ field }) => (
                        <Datetime
                          {...field}
                          closeOnSelect
                          inputProps={{
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                          }}
                        />
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.applicationsEndTime && (
                    <p className="text-xs text-pink-500">
                      {errors.applicationsEndTime?.message}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs mt-4 mb-2">Round</p>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <div
                    className={`relative border rounded-md px-3 py-2 mb-2 shadow-sm focus-within:ring-1 ${
                      errors.roundStartTime
                        ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                        : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                    }`}
                  >
                    <label
                      htmlFor="roundStartTime"
                      className="block text-[10px]"
                    >
                      Start Date
                    </label>
                    <Controller
                      control={control}
                      name="roundStartTime"
                      render={({ field }) => (
                        <Datetime
                          {...field}
                          closeOnSelect
                          inputProps={{
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                          }}
                        />
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.roundStartTime && (
                    <p className="text-xs text-pink-500">
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
                    <label htmlFor="roundEndTime" className="block text-[10px]">
                      End Date
                    </label>
                    <Controller
                      control={control}
                      name="roundEndTime"
                      render={({ field }) => (
                        <Datetime
                          {...field}
                          closeOnSelect
                          inputProps={{
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                          }}
                        />
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.roundEndTime && (
                    <p className="text-xs text-pink-500">
                      {errors.roundEndTime?.message}
                    </p>
                  )}
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
