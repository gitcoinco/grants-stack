import { Fragment, useContext, useState } from "react";

import {
  Control,
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

import { Program, Round } from "../api/types";
import { FormContext } from "../common/FormWizard";
import { Input } from "../common/styles";
import { FormStepper } from "../common/FormStepper";
import { Listbox, RadioGroup, Transition } from "@headlessui/react";
import {
  CheckIcon,
  SelectorIcon,
  InformationCircleIcon,
} from "@heroicons/react/solid";
import {
  getPayoutTokenOptions,
  getVotingOptions,
  PayoutToken,
  SupportType,
  VotingOption,
} from "../api/utils";
import { useWallet } from "../common/Auth";
import moment from "moment";
import ReactTooltip from "react-tooltip";

const ValidationSchema = yup.object().shape({
  roundMetadata: yup.object({
    name: yup
      .string()
      .required("This field is required.")
      .min(8, "Round name must be at least 8 characters."),
    matchingFunds: yup.object({
      matchingFundsAvailable: yup
        .number()
        .typeError("Matching funds available must be valid number.")
        .moreThan(0, "Matching funds available must be more than zero."),
      matchingCap: yup
        .boolean()
        .required("You must select if you want a matching cap for projects."),
      matchingCapAmount: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .when("matchingCap", {
          is: true,
          then: yup
            .number()
            .required("You must provide an amount for the matching cap.")
            .moreThan(0, "Matching cap amount must be more than zero."),
        }),
    }),
    support: yup.object({
      type: yup
        .string()
        .required("You must select a support type.")
        .notOneOf(
          ["Select what type of input."],
          "You must select a support type."
        ),
      info: yup
        .string()
        .required("This field is required.")
        .when("type", {
          is: "Email",
          then: yup
            .string()
            .email()
            .required("You must provide a valid email address."),
        })
        .when("type", {
          is: (val: string) => val && val != "Email",
          then: yup.string().url().required("You must provide a valid URL."),
        }),
    }),
    voting: yup
      .string()
      .required("You must select a voting strategy for your round.")
      .notOneOf(
        ["Choose Voting Strategy"],
        "You must select a voting strategy for your round."
      ),
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
  initialData?: { program?: Program };
}

export function RoundDetailForm(props: RoundDetailFormProps) {
  const program = props.initialData?.program;
  const { currentStep, setCurrentStep, stepsCount, formData, setFormData } =
    useContext(FormContext);
  const defaultRoundMetadata = {
    matchingFunds: {
      matchingCap: false,
    },
    ...((formData as Partial<Round>)?.roundMetadata ?? {}),
  };
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Round>({
    defaultValues: {
      ...formData,
      roundMetadata: defaultRoundMetadata,
    },
    resolver: yupResolver(ValidationSchema),
  });

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

  const votingOptions: VotingOption[] = [
    {
      name: "Choose Voting Strategy",
      strategy: "",
      default: true,
    },
    ...getVotingOptions(),
  ];

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

  function quadraticFundingSettings() {
    return (
      <>
        <hr className="my-8" />
        <p className="text-grey-400 mb-4">Quadratic Funding Settings</p>
        <div className="grid grid-cols-6 gap-6">
          <PayoutTokenDropdown
            errors={errors}
            register={register("token")}
            control={control}
            payoutTokenOptions={payoutTokenOptions}
          />
          <MatchingFundsAvailable
            errors={errors}
            register={register(
              "roundMetadata.matchingFunds.matchingFundsAvailable",
              {
                valueAsNumber: true,
              }
            )}
            token={watch("token")}
            payoutTokenOptions={payoutTokenOptions}
          />
          <MatchingCap
            errors={errors}
            registerMatchingCapAmount={register(
              "roundMetadata.matchingFunds.matchingCapAmount",
              {
                valueAsNumber: true,
              }
            )}
            control={control}
          />
          <VotingStrategyDropdown
            errors={errors}
            register={register("roundMetadata.voting")}
            control={control}
            votingOptions={votingOptions}
          />
        </div>
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
                <div className="col-span-6 sm:col-span-3">
                  <ContactInformation
                    register={register("roundMetadata.support.info")}
                    errors={errors}
                  />
                </div>
              </div>

              <p className="mt-6 mb-4 text-sm">
                What are the dates for the Applications and Round voting
                period(s)?
                <ApplicationDatesInformation />
              </p>

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
                          utc={true}
                          dateFormat={"YYYY-MM-DD"}
                          timeFormat={"HH:mm UTC"}
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
                          utc={true}
                          dateFormat={"YYYY-MM-DD"}
                          timeFormat={"HH:mm UTC"}
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
                          utc={true}
                          dateFormat={"YYYY-MM-DD"}
                          timeFormat={"HH:mm UTC"}
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
                          utc={true}
                          dateFormat={"YYYY-MM-DD"}
                          timeFormat={"HH:mm UTC"}
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
              {quadraticFundingSettings()}
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
      <div className="flex justify-between">
        <label htmlFor="roundMetadata.name" className="text-sm">
          Round Name
        </label>
        <span className="text-right text-violet-400 float-right text-xs mt-1">
          *Required
        </span>
      </div>
      <Input
        {...props.register}
        className={"h-10"}
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
      className={`relative w-full cursor-default rounded-md border h-10 ${
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
          <span className="ml-3 block truncate text-gray-400">
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

function VotingStrategyButton(props: {
  errors: FieldErrors<Round>;
  voting?: VotingOption;
}) {
  const { voting } = props;
  return (
    <Listbox.Button
      className={`relative w-full cursor-default rounded-md border h-10 ${
        props.errors.token
          ? "border-red-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
          : "border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
      }`}
      data-testid="voting-strategy-select"
    >
      <span className="flex items-center">
        {voting?.default ? (
          <span className="ml-3 block truncate text-gray-400">
            {voting?.name}
          </span>
        ) : (
          <span className="ml-3 block truncate">{voting?.name}</span>
        )}
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
        <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </span>
    </Listbox.Button>
  );
}

function ProgramChain(props: { program: Program }) {
  const { program } = props;
  return (
    <div className="col-span-6 sm:col-span-3 opacity-50">
      <Listbox disabled>
        <div>
          <Listbox.Label className="block text-sm">Program Chain</Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button
              className={`relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm sm:text-sm h-10`}
            >
              <span className="flex items-center">
                {program.chain?.logo && (
                  <img
                    src={program.chain.logo}
                    alt="chain logo"
                    data-testid="chain-logo"
                    className="h-5 w-5 flex-shrink-0 rounded-full"
                  />
                )}
                {
                  <span className="ml-3 block truncate">
                    {program.chain?.name}
                  </span>
                }
              </span>
            </Listbox.Button>
          </div>
        </div>
      </Listbox>
    </div>
  );
}

function PayoutTokenInformation() {
  return (
    <>
      <InformationCircleIcon
        data-tip
        data-background-color="#0E0333"
        data-for="payout-token-tooltip"
        className="inline h-4 w-4 ml-2 mr-3 mb-1"
        data-testid={"payout-token-tooltip"}
      />
      <ReactTooltip
        id="payout-token-tooltip"
        place="bottom"
        type="dark"
        effect="solid"
      >
        <p className="text-xs">
          The payout token is the token <br />
          that you will use to distribute <br />
          matching funds to your grantees.
        </p>
      </ReactTooltip>
    </>
  );
}

function PayoutTokenDropdown(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control: Control<Round>;
  payoutTokenOptions: PayoutToken[];
}) {
  const { field } = useController({
    name: "token",
    defaultValue: props.payoutTokenOptions[0].address,
    control: props.control,
    rules: {
      required: true,
    },
  });
  return (
    <div className="relative col-span-6 sm:col-span-3">
      <Listbox {...field}>
        {({ open }) => (
          <div>
            <Listbox.Label className="block text-sm">
              <span>Payout Token</span>
              <span className="text-right text-violet-400 float-right text-xs mt-1">
                *Required
              </span>
              <PayoutTokenInformation />
            </Listbox.Label>
            <div className="mt-1 mb-2 shadow-sm block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <PayoutTokenButton
                errors={props.errors}
                token={props.payoutTokenOptions.find(
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
                  {props.payoutTokenOptions.map(
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
                                    selected ? "font-semibold" : "font-normal",
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
            {props.errors.token && (
              <p className="mt-2 text-xs text-pink-500">
                {props.errors.token?.message}
              </p>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
}

function VotingStrategyDropdown(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control: Control<Round>;
  votingOptions: VotingOption[];
}) {
  const { field } = useController({
    name: "votingStrategy",
    defaultValue: props.votingOptions[0].strategy,
    control: props.control,
    rules: {
      required: true,
    },
  });
  return (
    <div className="relative col-span-6 sm:col-span-3">
      <Listbox {...field}>
        {({ open }) => (
          <div>
            <Listbox.Label className="block text-sm">
              <span>Voting Strategy</span>
              <span className="text-right text-violet-400 float-right text-xs mt-1">
                *Required
              </span>
            </Listbox.Label>
            <div className="mt-1 mb-2 shadow-sm block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <VotingStrategyButton
                errors={props.errors}
                voting={props.votingOptions.find((t) => t.name === field.value)}
              />
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {props.votingOptions.map(
                    (votingOption) =>
                      !votingOption.default && (
                        <Listbox.Option
                          key={votingOption.name}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "text-white bg-indigo-600"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-3 pr-9"
                            )
                          }
                          value={votingOption.strategy}
                          data-testid="voting-strategy-option"
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  {votingOption.name}
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
            {props.errors.roundMetadata?.voting && (
              <p className="mt-2 text-xs text-pink-500">
                {props.errors.roundMetadata?.voting.message}
              </p>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
}

function MatchingFundsAvailable(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  token: string;
  payoutTokenOptions: PayoutToken[];
}) {
  // not sure why UseFormRegisterReturn only takes strings for react-hook-form
  return (
    <div className="col-span-6 sm:col-span-3">
      <div className="flex justify-between">
        <label htmlFor="matchingFundsAvailable" className="text-sm">
          Matching Funds Available
        </label>
        <span className="text-right text-violet-400 float-right text-xs mt-1">
          *Required
        </span>
      </div>

      <div className="relative mt-1 rounded-md shadow-sm">
        <Input
          {...props.register}
          className={
            "block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
          }
          type="number"
          id={"roundMetadata.matchingFunds.matchingFundsAvailable"}
          $hasError={
            props.errors?.roundMetadata?.matchingFunds?.matchingFundsAvailable
          }
          placeholder="Enter the amount in chosen payout token."
          data-testid="matching-funds-available"
          aria-describedby="price-currency"
          step="any"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 pr-10 flex items-center">
          <span className="text-gray-400 sm:text-sm">
            {
              props.payoutTokenOptions.find(
                (token) => token.address === props.token
              )?.name
            }
          </span>
        </div>
      </div>
      {props.errors.roundMetadata?.matchingFunds?.matchingFundsAvailable && (
        <p className="text-xs text-pink-500">
          {
            props.errors.roundMetadata?.matchingFunds?.matchingFundsAvailable
              .message
          }
        </p>
      )}
    </div>
  );
}

// TODO - maybe clear matching cap amount when isMatchingCap switches to "No" ?
function MatchingCap(props: {
  registerMatchingCapAmount: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control?: Control<Round>;
}) {
  const { field: matchingCapField } = useController({
    name: "roundMetadata.matchingFunds.matchingCap",
    defaultValue: false,
    control: props.control,
    rules: {
      required: true,
    },
  });
  const { value: isMatchingCap } = matchingCapField;

  return (
    <>
      {" "}
      <div className="col-span-6 sm:col-span-3">
        <RadioGroup {...matchingCapField} data-testid="matching-cap-selection">
          <RadioGroup.Label className="block text-sm">
            <p className="text-sm">
              <span>Do you want a matching cap for projects?</span>
              <span className="text-right text-violet-400 float-right text-xs mt-1">
                *Required
              </span>
              <InformationCircleIcon
                data-tip
                data-background-color="#0E0333"
                data-for="matching-cap-tooltip"
                className="inline h-4 w-4 ml-2 mr-3 mb-1"
                data-testid={"matching-cap-tooltip"}
              />
            </p>
            <ReactTooltip
              id="matching-cap-tooltip"
              place="bottom"
              type="dark"
              effect="solid"
            >
              <p className="text-xs">
                This will cap the percentage <br />
                of your overall matching pool <br />
                that a single grantee can receive.
              </p>
            </ReactTooltip>
          </RadioGroup.Label>
          <div className="flex flex-row gap-4 mt-3">
            <RadioGroup.Option value={true}>
              {({ checked, active }) => (
                <span className="flex items-center text-sm">
                  <span
                    className={classNames(
                      checked
                        ? "bg-indigo-600 border-transparent"
                        : "bg-white border-gray-300",
                      active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                      "h-4 w-4 rounded-full border flex items-center justify-center"
                    )}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                  <RadioGroup.Label
                    as="span"
                    className="ml-3 block text-sm text-gray-700"
                    data-testid="matching-cap-true"
                  >
                    Yes
                  </RadioGroup.Label>
                </span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value={false}>
              {({ checked, active }) => (
                <span className="flex items-center text-sm">
                  <span
                    className={classNames(
                      checked
                        ? "bg-indigo-600 border-transparent"
                        : "bg-white border-gray-300",
                      active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                      "h-4 w-4 rounded-full border flex items-center justify-center"
                    )}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                  <RadioGroup.Label
                    as="span"
                    className="ml-3 block text-sm text-gray-700"
                    data-testid="matching-cap-false"
                  >
                    No
                  </RadioGroup.Label>
                </span>
              )}
            </RadioGroup.Option>
          </div>
        </RadioGroup>
      </div>
      <div className="col-span-6 sm:col-span-3">
        <label htmlFor="matchingCapAmount" className="block text-sm">
          <p className="text-sm">
            <span>If so, how much?</span>
            <span className="text-right text-violet-400 float-right text-xs mt-1">
              *Required
            </span>
          </p>
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-400 sm:text-sm">%</span>
          </div>
          <Input
            className={
              "block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 h-10"
            }
            {...props.registerMatchingCapAmount}
            $hasError={
              isMatchingCap &&
              props.errors?.roundMetadata?.matchingFunds?.matchingCapAmount
            }
            type="number"
            id={"matchingCapAmount"}
            disabled={!isMatchingCap}
            placeholder="Enter matching cap in form of percentage."
            data-testid="matching-cap-percent"
            aria-describedby="percentage-symbol"
            max="100"
            step="any"
          />
        </div>
        {isMatchingCap &&
          props.errors?.roundMetadata?.matchingFunds?.matchingCapAmount && (
            <p className="text-xs text-pink-500">
              {
                props.errors.roundMetadata?.matchingFunds?.matchingCapAmount
                  ?.message
              }
            </p>
          )}
      </div>
    </>
  );
}

function ContactInformation(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
}) {
  return (
    <div className="mt-2 mb-2">
      <div className="flex justify-between">
        <label htmlFor="roundMetadata.support.info" className="text-sm">
          Contact Information
        </label>
        <span className="text-right text-violet-400 float-right text-xs mt-1">
          *Required
        </span>
      </div>
      <Input
        {...props.register}
        className={"h-10"}
        $hasError={props.errors.roundMetadata?.support?.info}
        type="text"
        placeholder="Enter desired form of contact here. Ex: website, email..."
        id={"roundMetadata.support.info"}
      />
      {props.errors.roundMetadata?.support?.info && (
        <p className="text-xs text-pink-500">
          {props.errors.roundMetadata?.support.info?.message}
        </p>
      )}
    </div>
  );
}

function SupportTypeButton(props: {
  errors: FieldErrors<Round>;
  supportType?: SupportType;
}) {
  const { supportType } = props;
  return (
    <Listbox.Button
      className={`relative w-full cursor-default rounded-md border h-10 bg-white py-2 pl-3 pr-10 text-left shadow-sm ${
        props.errors.roundMetadata?.support?.type
          ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
          : "border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
      }`}
      data-testid="support-type-select"
      id={"roundMetadata.support.type"}
    >
      <span className="flex items-center">
        {supportType?.default ? (
          <span className="ml-3 block truncate text-gray-400">
            {supportType?.name}
          </span>
        ) : (
          <span className="ml-3 block truncate">{supportType?.name}</span>
        )}
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
        <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </span>
    </Listbox.Button>
  );
}

function SupportTypeDropdown(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control: Control<Round>;
  supportTypes: SupportType[];
}) {
  const { field } = useController({
    name: "roundMetadata.support.type",
    defaultValue: props.supportTypes[0].name,
    control: props.control,
    rules: {
      required: true,
    },
  });
  return (
    <div className="col-span-6 sm:col-span-3 relative mt-2">
      <Listbox {...field}>
        {({ open }) => (
          <div>
            <Listbox.Label className="text-sm mt-4 mb-2">
              <p className="text-sm">
                <span>Support Input</span>
                <span className="text-right text-violet-400 float-right text-xs mt-1">
                  *Required
                </span>
              </p>
            </Listbox.Label>
            <div className="mt-1 mb-2 shadow-sm block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <SupportTypeButton
                errors={props.errors}
                supportType={props.supportTypes.find(
                  (supportType) => supportType.name === field.value
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
                  {props.supportTypes.map(
                    (type) =>
                      !type.default && (
                        <Listbox.Option
                          key={type.name}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "text-white bg-indigo-600"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-3 pr-9"
                            )
                          }
                          value={type.name}
                          data-testid="support-type-option"
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  {type.name}
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
            {props.errors.roundMetadata?.support?.type && (
              <p className="mt-2 text-xs text-pink-500">
                {
                  "You must select a support type."
                  // TODO: Use YUP for error message
                }
              </p>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
}

function Support(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control: Control<Round>;
}) {
  // TODO: Add regex for URLs
  const supportTypes: SupportType[] = [
    {
      name: "Select what type of input.",
      regex: "https://www.google.com",
      default: true,
    },
    {
      name: "Email",
      regex: "https://www.google.com",
      default: false,
    },
    {
      name: "Website",
      regex: "https://www.google.com",
      default: false,
    },
    {
      name: "Discord Group Invite Link",
      regex: "https://www.google.com",
      default: false,
    },
    {
      name: "Telegram Group Invite Link",
      regex: "https://www.google.com",
      default: false,
    },
    {
      name: "Google Form Link",
      regex: "https://www.google.com",
      default: false,
    },
    {
      name: "Other (please provide a link)",
      regex: "https://www.google.com",
      default: false,
    },
  ];

  return (
    <SupportTypeDropdown
      register={props.register}
      errors={props.errors}
      control={props.control}
      supportTypes={supportTypes}
    />
  );
}

function ApplicationDatesInformation() {
  return (
    <>
      <InformationCircleIcon
        data-tip
        data-background-color="#0E0333"
        data-for="application-dates-tooltip"
        className="inline h-4 w-4 ml-2 mr-3 mb-1"
        data-testid="application-dates-tooltip"
      />
      <ReactTooltip
        id="application-dates-tooltip"
        place="bottom"
        type="dark"
        effect="solid"
      >
        <p className="text-xs">All dates are in UTC.</p>
      </ReactTooltip>
    </>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
