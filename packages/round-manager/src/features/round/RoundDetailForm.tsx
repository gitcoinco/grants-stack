import { Fragment, useContext, useState } from "react";

import {
  Controller,
  FieldErrors,
  SubmitHandler,
  useController,
  useForm,
  UseFormRegisterReturn,
} from "react-hook-form";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Round } from "../api/types";
import { FormContext } from "../common/FormWizard";
import { Input } from "../common/styles";
import { FormStepper } from "../common/FormStepper";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { getPayoutTokenOptions, PayoutToken } from "../api/utils";
import { useWallet } from "../common/Auth";
import moment from "moment";

//TODO: Time defaults to next hour - Date Picker
/*

- Time in picker should start out with their current time
- round it to next hour
- refactor and remove moment and use luxon
- refactor some JSX into well named small components

*/

const ValidationSchema = yup.object().shape({
  roundMetadata: yup.object({
    name: yup
      .string()
      .required("This field is required.")
      .min(8, "Round name must be at least 8 characters."),
  }),
  applicationsStartTime: yup
    .date()
    .required("This field is required.")
    .min(new Date(), "You must enter a date and time in the future."),
  applicationsEndTime: yup
    .date()
    .required("This field is required.")
    .min(
      yup.ref("applicationsStartTime"),
      "Applications end date must be later than applications start date"
    ),
  roundStartTime: yup
    .date()
    .required("This field is required.")
    .min(
      yup.ref("applicationsStartTime"),
      "Round start date must be later than applications start date"
    ),
  roundEndTime: yup
    .date()
    .min(
      yup.ref("roundStartTime"),
      "Round end date must be later than the round start date"
    ),
  token: yup
    .string()
    .required("You must select a payout token for your round.")
    .notOneOf(
      ["Choose Payout Token"],
      "You must select a payout token for your round."
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
  const [applicationStartDate, setApplicationStartDate] = useState(moment());
  const [roundStartDate, setRoundStartDate] = useState(applicationStartDate);

  const next: SubmitHandler<Round> = async (values) => {
    const data = { ...formData, ...values };
    setFormData(data);
    setCurrentStep(currentStep + 1);
  };

  const now = moment().add(1, "hour").startOf("hour");
  const prev = () => setCurrentStep(currentStep - 1);
  const yesterday = moment().subtract(1, "day");
  const disablePastDate = (current: moment.Moment) => {
    return current.isAfter(yesterday);
  };

  function disableBeforeApplicationStartDate(current: moment.Moment) {
    return current.isAfter(applicationStartDate);
  }

  function disableBeforeRoundStartDate(current: moment.Moment) {
    return current.isAfter(roundStartDate);
  }

  const { chain } = useWallet();
  const payoutTokenOptions: PayoutToken[] = [
    {
      name: "Choose Payout Token",
      chainId: chain.id,
      address: "",
      default: true,
    },
    ...getPayoutTokenOptions(chain.id),
  ];

  const { field } = useController({
    name: "token",
    defaultValue: payoutTokenOptions[0].address,
    control,
    rules: {
      required: true,
    },
  });

  function payoutTokenSettings() {
    return (
      <>
        <hr className="my-8" />
        <p className="text-grey-400 mb-4">Quadratic Funding Settings</p>
        <Listbox {...field}>
          {({ open }) => (
            <div>
              <Listbox.Label className="block text-sm font-medium">
                Payout Token
              </Listbox.Label>
              <div className="relative mt-1">
                <PayoutTokenButton
                  errors={errors}
                  token={payoutTokenOptions.find(
                    (t) => t.address === field.value
                  )}
                />

                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {payoutTokenOptions.map(
                      (token) =>
                        !token.default && (
                          <Listbox.Option
                            key={token.name}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? "text-white bg-indigo-600"
                                  : "text-gray-900",
                                "relative cursor-default select-none py-2 pl-3 pr-9"
                              )
                            }
                            value={token.address}
                            data-testid="payout-token-option"
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  {token.logo ? (
                                    <img
                                      src={token.logo}
                                      alt=""
                                      className="h-6 w-6 flex-shrink-0 rounded-full"
                                    />
                                  ) : null}
                                  <span
                                    className={classNames(
                                      selected
                                        ? "font-semibold"
                                        : "font-normal",
                                      "ml-3 block truncate"
                                    )}
                                  >
                                    {token.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? "text-white" : "text-indigo-600",
                                      "absolute inset-y-0 right-0 flex items-center pr-4"
                                    )}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        )
                    )}
                  </Listbox.Options>
                </Transition>
              </div>
              {errors.token && (
                <p className="mt-2 text-xs text-pink-500">
                  {errors.token?.message}
                </p>
              )}
            </div>
          )}
        </Listbox>
      </>
    );
  }

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
            data-testid={"roundDetailForm"}
            onSubmit={handleSubmit(next)}
            className="shadow-sm text-grey-500"
          >
            <div className="pt-7 pb-10 sm:px-6 bg-white">
              <div className="grid grid-cols-6 gap-6">
                <RoundName
                  register={register("roundMetadata.name")}
                  errors={errors}
                />
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
                          onChange={(date) => {
                            setApplicationStartDate(moment(date));
                            field.onChange(moment(date));
                          }}
                          inputProps={{
                            id: "applicationsStartTime",
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-40  0 focus:ring-0 text-sm",
                          }}
                          isValidDate={disablePastDate}
                          initialViewDate={now}
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
                            id: "applicationsEndTime",
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                          }}
                          isValidDate={disableBeforeApplicationStartDate}
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
                    <p
                      className="text-xs text-pink-500"
                      data-testid="application-end-date-error"
                    >
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
                          onChange={(date) => {
                            setRoundStartDate(moment(date));
                            field.onChange(moment(date));
                          }}
                          inputProps={{
                            id: "roundStartTime",
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                          }}
                          isValidDate={disableBeforeApplicationStartDate}
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
                            id: "roundEndTime",
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                          }}
                          isValidDate={disableBeforeRoundStartDate}
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
                    <p
                      className="text-xs text-pink-500"
                      data-testid="round-end-date-error"
                    >
                      {errors.roundEndTime?.message}
                    </p>
                  )}
                </div>
              </div>
              {payoutTokenSettings()}
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

function RoundName(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
}) {
  return (
    <div className="col-span-6 sm:col-span-3">
      <label htmlFor="roundMetadata.name" className="block text-xs font-medium">
        Round Name
      </label>
      <Input
        {...props.register}
        $hasError={props.errors.roundMetadata?.name}
        type="text"
        id={"roundMetadata.name"}
      />
      {props.errors.roundMetadata?.name && (
        <p className="text-xs text-pink-500">
          {props.errors.roundMetadata?.name?.message}
        </p>
      )}
    </div>
  );
}
function PayoutTokenButton(props: {
  errors: FieldErrors<Round>;
  token?: PayoutToken;
}) {
  const { token } = props;
  return (
    <Listbox.Button
      className={`relative w-full cursor-default rounded-md border ${
        props.errors.token
          ? "border-red-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
          : "border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
      }`}
      data-testid="payout-token-select"
    >
      <span className="flex items-center">
        {token?.logo ? (
          <img
            src={token?.logo}
            alt=""
            className="h-6 w-6 flex-shrink-0 rounded-full"
          />
        ) : null}
        {token?.default ? (
          <span className="ml-3 block truncate text-gray-500">
            {token?.name}
          </span>
        ) : (
          <span className="ml-3 block truncate">{token?.name}</span>
        )}
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
        <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </span>
    </Listbox.Button>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
