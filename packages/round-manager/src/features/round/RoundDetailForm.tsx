import {
  CheckIcon,
  InformationCircleIcon,
  SelectorIcon,
} from "@heroicons/react/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import { classNames } from "common";
import { Input } from "common/src/styles";
import _ from "lodash";
import moment from "moment";
import { Fragment, useContext, useEffect, useState } from "react";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormRegisterReturn,
  useController,
  useForm,
} from "react-hook-form";

import { Listbox, RadioGroup, Transition } from "@headlessui/react";
import ReactTooltip from "react-tooltip";
import * as yup from "yup";
import { Program, Round, RoundCategory } from "../api/types";
import { SupportType } from "../api/utils";
import { FormStepper } from "../common/FormStepper";
import { FormContext } from "../common/FormWizard";

export const RoundValidationSchema = yup.object().shape({
  roundMetadata: yup.object({
    name: yup
      .string()
      .required("This field is required.")
      .min(8, "Round name must be at least 8 characters."),
    roundType: yup.string().required("You must select the round type."),
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
          then: yup
            .string()
            /*Matches www.example.com, example.com, http and https prefixes, but not www.invalid */
            .matches(
              /^(http:\/\/|https:\/\/|ipfs:\/\/)?\S+\.\S+$|^(ipfs:\/\/)\S+$/,
              "Must be a valid URL"
            )
            .required("You must provide a valid URL."),
        }),
    }),
  }),
  applicationsStartTime: yup.date().when("$roundCategory", {
    is: RoundCategory.QuadraticFunding,
    then: yup
      .date()
      .required("This field is required.")
      .min(
        yup.ref("applicationsStartTime"),
        "You must enter a date and time in the future."
      )
      .max(
        yup.ref("roundStartTime"),
        "Applications start date must be before the round start date."
      )
      .max(
        yup.ref("roundEndTime"),
        "Applications start date must be before the round end date."
      ),
  }),
  applicationsEndTime: yup.date().when("$roundCategory", {
    is: RoundCategory.QuadraticFunding,
    then: yup
      .date()
      .required("This field is required.")
      .min(
        yup.ref("applicationsStartTime"),
        "Applications end date must be later than applications start date."
      )
      .max(
        yup.ref("roundEndTime"),
        "Applications end date must be before the round end date."
      ),
  }),
  roundStartTime: yup
    .date()
    .required("This field is required.")
    .when("$roundCategory", {
      is: RoundCategory.QuadraticFunding,
      then: yup
        .date()
        .min(
          yup.ref("applicationsStartTime"),
          "Round start date must be later than the applications start date."
        )
        .max(
          yup.ref("roundEndTime"),
          "Round start date must be earlier than the round end date."
        ),
    }),
  roundEndTimeDisabled: yup.boolean(),
  roundEndTime: yup
    .date()
    .nullable()
    .when("roundEndTimeDisabled", {
      is: false,
      then: yup
        .date()
        .nullable()
        .required("This field is required.")
        .min(
          yup.ref("roundStartTime"),
          "Round end date must be later than the round start date."
        ),
    }),
});

interface RoundDetailFormProps {
  stepper: typeof FormStepper;
  initialData?: { program?: Program };
  configuration?: { roundCategory?: RoundCategory };
}

export function RoundDetailForm(props: RoundDetailFormProps) {
  const program = props.initialData?.program;
  const roundCategory =
    props.configuration?.roundCategory ?? RoundCategory.QuadraticFunding;

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
    setValue,
    formState: { errors },
    watch,
  } = useForm<Round>({
    defaultValues: {
      ...formData,
      roundMetadata: defaultRoundMetadata,
      roundEndTimeDisabled: false,
    },
    context: { roundCategory },
    resolver: yupResolver(RoundValidationSchema),
  });

  const isRoundEndTimeDisabled = watch("roundEndTimeDisabled");

  const FormStepper = props.stepper;
  const [applicationStartDate, setApplicationStartDate] = useState(moment());
  const [, setApplicationEndDate] = useState(moment());
  const [roundStartDate, setRoundStartDate] = useState(moment());
  const [roundEndDate, setRoundEndDate] = useState<moment.Moment | "">("");
  const [rollingApplications, setRollingApplications] = useState(false);

  const next: SubmitHandler<Round> = async (values) => {
    /* Insert HTTPS into support URL if missing */
    if (
      values.roundMetadata.support?.type === "Website" &&
      !/^(https?|ipfs):\/\//.test(values.roundMetadata.support.info)
    ) {
      values.roundMetadata.support.info = `https://${values.roundMetadata.support.info}`;
    }
    const data = _.merge(formData, values);
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

  const disablePastAndBeforeRoundStartDate = (current: moment.Moment) => {
    return disablePastDate(current);
  };

  function disableBeforeRoundStartDate(current: moment.Moment) {
    return current.isAfter(roundStartDate);
  }

  useEffect(() => {
    if (rollingApplications && roundEndDate !== "") {
      setValue("applicationsEndTime", roundEndDate.toDate());
      setApplicationEndDate(roundEndDate);
    }
  }, [rollingApplications, roundEndDate, setValue]);

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
            {/* Round inputs */}
            <div className="pt-7 sm:px-6 bg-white">
              <div className="grid grid-cols-6 gap-6 mb-4">
                <RoundName
                  register={register("roundMetadata.name")}
                  errors={errors}
                />
                {program && <ProgramChain program={program} />}
              </div>

              {/* support */}
              <div className="mt-8 mb-3 text-sm text-grey-400">
                <p>
                  Where can applicants reach you and/or your team if support is
                  needed?
                </p>
              </div>
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

              {/* Dates explanation */}
              <div className="mt-6 mb-3 text-sm text-grey-400">
                {roundCategory === RoundCategory.QuadraticFunding ? (
                  <>
                    <p>
                      What are the dates for the Applications and Round voting
                      period(s)?
                      <ApplicationDatesInformation />
                    </p>
                    <p className="text-sm mt-0.5">
                      Tips: You can accept applications even after the round
                      starts by setting up overlapping Applications and Round
                      periods!
                    </p>
                  </>
                ) : (
                  <p>What are the dates for this round? </p>
                )}
              </div>

              {/* Application dates */}
              {roundCategory === RoundCategory.QuadraticFunding && (
                <>
                  <p className="text-sm mb-2">
                    <span>Applications</span>
                    <span className="text-right text-violet-400 float-right text-xs mt-1">
                      *Required
                    </span>
                  </p>

                  <div className="grid grid-cols-6 gap-6 mb-1">
                    {/* Application start date */}
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
                              isValidDate={disablePastAndBeforeRoundStartDate}
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
                      <div className="flex items-center mt-2">
                        <input
                          id="rollingApplications"
                          name="rollingApplications"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={rollingApplications}
                          onChange={(e) =>
                            setRollingApplications(e.target.checked)
                          }
                        />
                        <label
                          htmlFor="rollingApplications"
                          className="ml-2 block text-sm text-grey-400"
                        >
                          Enable rolling applications
                        </label>
                        <InformationCircleIcon
                          data-tip
                          data-for="rollingApplicationsTooltip"
                          className="h-4 w-4 ml-1 text-grey-400"
                        />
                        <ReactTooltip
                          id="rollingApplicationsTooltip"
                          place="top"
                          effect="solid"
                          className="text-grey-400"
                        >
                          <span>
                            If enabled, applications will be accepted until the
                            round ends.
                          </span>
                        </ReactTooltip>
                      </div>
                    </div>
                    {/* Application end date */}
                    <div className="col-span-6 sm:col-span-3">
                      <div
                        className={`relative border rounded-md px-3 py-2 mb-2 shadow-sm focus-within:ring-1 ${
                          errors.applicationsEndTime
                            ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                            : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                        } ${
                          rollingApplications
                            ? "cursor-not-allowed bg-gray-100"
                            : ""
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
                              onChange={(date) => {
                                setApplicationEndDate(moment(date));
                                field.onChange(moment(date));
                              }}
                              inputProps={{
                                id: "applicationsEndTime",
                                placeholder: "",
                                className:
                                  "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
                                disabled: rollingApplications,
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
                </>
              )}

              {/* Round dates */}
              <>
                <p className="text-sm mt-4 mb-2">
                  Round
                  <span className="text-right text-violet-400 float-right text-xs mt-1">
                    *Required
                  </span>
                </p>
                <div className="grid grid-cols-6 gap-6">
                  {/* Round start date */}
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

                    {/* Round end date */}
                    {roundCategory === RoundCategory.Direct && (
                      <Controller
                        control={control}
                        name="roundEndTimeDisabled"
                        render={({ field }) => (
                          <div className="flex items-center mt-2">
                            <input
                              id="noEndDate"
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                if (e.target.checked) {
                                  // reset input and trick type validation
                                  // for direct round, when date is empty it will be set to maxDate
                                  setValue(
                                    "roundEndTime",
                                    null as unknown as Date
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor="noEndDate"
                              className="ml-2 block text-sm text-grey-400"
                            >
                              This round does not have an end date
                            </label>
                          </div>
                        )}
                      />
                    )}
                  </div>

                  {/* Round end date */}
                  <div className="col-span-6 sm:col-span-3">
                    <div
                      className={`relative border rounded-md px-3 py-2 mb-2 shadow-sm focus-within:ring-1 ${
                        errors.roundEndTime
                          ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                          : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                      } ${
                        isRoundEndTimeDisabled
                          ? "cursor-not-allowed bg-gray-100"
                          : ""
                      }`}
                    >
                      <label
                        htmlFor="roundEndTime"
                        className="block text-[10px]"
                      >
                        End Date
                      </label>
                      <Controller
                        control={control}
                        name="roundEndTime"
                        render={({ field }) => {
                          return (
                            <Datetime
                              {...field}
                              closeOnSelect
                              inputProps={{
                                id: "roundEndTime",
                                placeholder: "",
                                disabled: isRoundEndTimeDisabled,
                                className:
                                  "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
                              }}
                              onChange={(date) => {
                                field.onChange(moment(date));
                                setRoundEndDate(moment(date));
                                if (rollingApplications) {
                                  setApplicationEndDate(moment(date));
                                  setValue(
                                    "applicationsEndTime",
                                    moment(date).toDate()
                                  );
                                }
                              }}
                              isValidDate={disableBeforeRoundStartDate}
                              utc={true}
                              // we use renderInput because there is a bug with the library
                              // if the input is cleared programmatically the value is removed
                              // but the visual date is not updated
                              // ref: https://stackoverflow.com/a/64972324/2524608
                              renderInput={(props) => {
                                return (
                                  <input
                                    {...props}
                                    value={
                                      field.value
                                        ? moment(field.value).format(
                                            "YYYY-MM-DD HH:mm UTC"
                                          )
                                        : ""
                                    }
                                  />
                                );
                              }}
                            />
                          );
                        }}
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
              </>
            </div>

            {/* Round Type */}
            <div className="p-6 bg-white">
              <div className="grid grid-rows-1 text-grey-400">
                <p>
                  Do you want to show your round on the Gitcoin Explorer
                  homepage?
                </p>
                <p className="text-sm mt-0.5">
                  <a
                    className="text-violet-400 mr-1"
                    href="https://explorer.gitcoin.co/"
                    target="_blank"
                  >
                    Gitcoin Explorer
                  </a>
                  is the place where supporters (donors) discover and donate to
                  projects.
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

            {/* Footer */}
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

export function ProgramChain(props: { program: Program }) {
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
        className={"h-10 mt-2"}
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

export function SupportTypeButton(props: {
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
  showLabel?: boolean;
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
            {props.showLabel ? (
              <Listbox.Label className="text-sm mt-4 mb-2">
                <p className="text-sm">
                  <span>Support Input</span>
                  <span className="text-right text-violet-400 float-right text-xs mt-1">
                    *Required
                  </span>
                </p>
              </Listbox.Label>
            ) : null}

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

// TODO: Add regex for URLs
export const supportTypes: SupportType[] = [
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

function Support(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control: Control<Round>;
}) {
  return (
    <div className="mt-2 mb-2">
      <div className="flex justify-between">
        <label htmlFor="roundMetadata.support.info" className="text-sm">
          Support Input
        </label>
        <span className="text-right text-violet-400 float-right text-xs mt-1">
          *Required
        </span>
      </div>

      <SupportTypeDropdown
        register={props.register}
        errors={props.errors}
        control={props.control}
        supportTypes={supportTypes}
      />
    </div>
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

function RoundType(props: {
  register: UseFormRegisterReturn<string>;
  control?: Control<Round>;
}) {
  const { field: roundTypeField } = useController({
    name: "roundMetadata.roundType",
    control: props.control,
    rules: {
      required: true,
    },
  });

  return (
    <>
      {" "}
      <div className="col-span-6 sm:col-span-3">
        <RadioGroup {...roundTypeField} data-testid="round-type-selection">
          <div>
            <RadioGroup.Option value="public" className="mb-2">
              {({ checked, active }) => (
                <span className="flex items-start text-sm">
                  <span
                    className={classNames(
                      checked
                        ? "bg-indigo-600 border-transparent"
                        : "bg-white border-gray-300",
                      active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                      "h-4 w-4 mt-1 rounded-full border flex items-center justify-center"
                    )}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                  <RadioGroup.Label
                    as="span"
                    className="ml-3 block text-sm text-gray-700"
                    data-testid="round-type-public"
                  >
                    Yes, make my round public
                    <p className="text-xs text-gray-400 mt-1">
                      Anyone on the Gitcoin Explorer homepage will be able to
                      see your round
                    </p>
                  </RadioGroup.Label>
                </span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value="private">
              {({ checked, active }) => (
                <span className="flex items-start text-sm">
                  <span
                    className={classNames(
                      checked
                        ? "bg-indigo-600 border-transparent"
                        : "bg-white border-gray-300",
                      active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                      "h-4 w-4 mt-1 rounded-full border flex items-center justify-center"
                    )}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                  <RadioGroup.Label
                    as="span"
                    className="ml-3 block text-sm text-gray-700"
                    data-testid="round-type-private"
                  >
                    No, keep my round private
                    <p className="text-xs text-gray-400 mt-1">
                      Only people with the round link can see your round.
                    </p>
                  </RadioGroup.Label>
                </span>
              )}
            </RadioGroup.Option>
          </div>
        </RadioGroup>
      </div>
    </>
  );
}
