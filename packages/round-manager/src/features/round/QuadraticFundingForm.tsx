import { Listbox, RadioGroup, Transition } from "@headlessui/react";
import {
  CheckIcon,
  InformationCircleIcon,
  SelectorIcon,
} from "@heroicons/react/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import { classNames } from "common";
import { Input } from "common/src/styles";
import _ from "lodash";
import { Fragment, useContext, useState } from "react";
import {
  Control,
  FieldErrors,
  SubmitHandler,
  UseFormRegisterReturn,
  useController,
  useForm,
  useWatch,
} from "react-hook-form";
import ReactTooltip from "react-tooltip";
import * as yup from "yup";
import { Round } from "../api/types";
import { PayoutToken, getPayoutTokenOptions } from "../api/utils";
import { useWallet } from "../common/Auth";
import { FormStepper } from "../common/FormStepper";
import { FormContext } from "../common/FormWizard";
interface QuadraticFundingFormProps {
  stepper: typeof FormStepper;
}

export const FundingValidationSchema = yup.object().shape({
  roundMetadata: yup.object().shape({
    quadraticFundingConfig: yup.object({
      matchingFundsAvailable: yup
        .number()
        .typeError("Matching funds available must be a valid number.")
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
            .moreThan(0, "Matching cap amount must be more than zero.")
            .max(
              100,
              "Matching cap amount must be less than or equal to 100%."
            ),
        }),
      minDonationThreshold: yup
        .boolean()
        .required("You must select if you want a minimum donation threshold."),
      minDonationThresholdAmount: yup
        .number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .when("minDonationThreshold", {
          is: true,
          then: yup
            .number()
            .required(
              "You must provide an amount for the minimum donation threshold."
            )
            .moreThan(0, "Minimum donation threshold must be more than zero."),
        }),
      sybilDefense: yup
        .boolean()
        .required("You must select if you want to use sybil defense."),
    }),
  }),
  token: yup
    .string()
    .required("You must select a payout token for your round.")
    .notOneOf(
      ["Choose Payout Token"],
      "You must select a payout token for your round."
    ),
});

export default function QuadraticFundingForm(props: QuadraticFundingFormProps) {
  const { currentStep, setCurrentStep, stepsCount, formData, setFormData } =
    useContext(FormContext);
  const initialQuadraticFundingConfig: Round["roundMetadata"]["quadraticFundingConfig"] =
    // @ts-expect-error Needs refactoring/typing as a whole
    formData?.roundMetadata.quadraticFundingConfig ?? {
      matchingFundsAvailable: 0,
      matchingCap: false,
      minDonationThreshold: false,
      sybilDefense: true,
    };

  const { chain } = useWallet();
  const payoutTokenOptions: PayoutToken[] = [
    {
      name: "Choose Payout Token",
      chainId: chain.id,
      address: "",
      default: true,
      decimal: 0,
    },
    ...getPayoutTokenOptions(chain.id),
  ];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<Round>({
    defaultValues: {
      ...formData,
      roundMetadata: {
        quadraticFundingConfig: initialQuadraticFundingConfig,
      },
    },
    resolver: yupResolver(FundingValidationSchema),
  });

  const FormStepper = props.stepper;

  const next: SubmitHandler<Round> = async (values) => {
    const data = _.merge(formData, values);
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
            onSubmit={handleSubmit(next, (errors) => {
              console.log(errors);
            })}
            className="shadow-sm text-grey-500"
          >
            {/* QF Settings */}
            <div className="p-6 bg-white">
              <p className="text-grey-400 mb-4">Quadratic Funding Settings</p>
              <div className="grid grid-cols-6 gap-6">
                <PayoutTokenDropdown
                  register={register("token")}
                  errors={errors}
                  control={control}
                  payoutTokenOptions={payoutTokenOptions}
                />
                <MatchingFundsAvailable
                  errors={errors}
                  register={register(
                    "roundMetadata.quadraticFundingConfig.matchingFundsAvailable",
                    {
                      valueAsNumber: true,
                    }
                  )}
                  token={watch("token")}
                  payoutTokenOptions={payoutTokenOptions}
                />
              </div>
            </div>

            {/* Matching Cap */}
            <div className="p-6 bg-white">
              <p className="text-grey-400 mb-4 mt-4">Matching Cap</p>
              <div className="grid grid-cols-6 gap-6">
                <MatchingCap
                  errors={errors}
                  registerMatchingCapAmount={register(
                    "roundMetadata.quadraticFundingConfig.matchingCapAmount",
                    {
                      valueAsNumber: true,
                    }
                  )}
                  control={control}
                  token={watch("token")}
                  payoutTokenOptions={payoutTokenOptions}
                />
              </div>
            </div>

            {/* Minimum Donation Threshold */}
            <div className="p-6 bg-white">
              <p className="text-grey-400 mb-4 mt-4">
                Minimum Donation Threshold
              </p>
              <div className="grid grid-cols-6 gap-6">
                <MinDonationThreshold
                  errors={errors}
                  registerMinDonationThreshold={register(
                    "roundMetadata.quadraticFundingConfig.minDonationThresholdAmount",
                    {
                      valueAsNumber: true,
                    }
                  )}
                  control={control}
                />
              </div>
            </div>

            {/* Sybil Defense */}
            <div className="p-6 bg-white">
              <div className="grid grid-rows-1 grid-cols-2">
                <div>
                  <p className="text-grey-400">Sybil Defense</p>
                </div>
                <div>
                  <p className="text-sm justify-end">
                    <span className="text-right text-violet-400 float-right text-xs mt-3">
                      *Required
                    </span>
                  </p>
                </div>
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
              </div>
              <p className="text-grey-400 mb-2 mt-1 text-sm">
                Ensure that project supporters are not bots or sybil with
                Gitcoin Passport. Learn more about Gitcoin Passport{" "}
                <a
                  href="https://docs.passport.gitcoin.co/overview/readme"
                  className="text-violet-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
                .
              </p>
              <div className="flex">
                <SybilDefense
                  errors={errors}
                  registerMatchingCapAmount={register(
                    "roundMetadata.quadraticFundingConfig.sybilDefense"
                  )}
                  control={control}
                />
              </div>
            </div>

            {/* FormStepper */}
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
      <p className="text-base leading-6">Funding Settings</p>
      <p className="mt-1 text-sm text-grey-400">
        What is the Round name, when do applications open/close, and when does
        it start and end?
      </p>
      <p className="mt-1 text-sm text-grey-400 pt-4">
        You can change this settings anytime before the round starts. Learn more
        about QF <a href="https://wtfisqf.com">here</a>.
      </p>
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

export function PayoutTokenInformation() {
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
            props.errors?.roundMetadata?.quadraticFundingConfig
              ?.matchingFundsAvailable
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
      {props.errors.roundMetadata?.quadraticFundingConfig
        ?.matchingFundsAvailable && (
        <p className="text-xs text-pink-500">
          {
            props.errors.roundMetadata?.quadraticFundingConfig
              ?.matchingFundsAvailable.message
          }
        </p>
      )}
    </div>
  );
}

function MatchingCap(props: {
  registerMatchingCapAmount: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control?: Control<Round>;
  token: string;
  payoutTokenOptions: PayoutToken[];
}) {
  const { field: matchingCapField } = useController({
    name: "roundMetadata.quadraticFundingConfig.matchingCap",
    defaultValue: false,
    control: props.control,
    rules: {
      required: true,
    },
  });
  const { value: isMatchingCap } = matchingCapField;
  // get matching cap amount from form

  const amt = useWatch({
    name: "roundMetadata.quadraticFundingConfig.matchingCapAmount",
    control: props.control,
  });

  const [matchingCapAmount, setMatchingCapAmount] = useState<
    string | undefined
  >(amt?.toString());

  const matchingFunds = useWatch({
    name: "roundMetadata.quadraticFundingConfig.matchingFundsAvailable",
    control: props.control,
  });

  const matchingValueNumber = (Number(matchingCapAmount) / 100) * matchingFunds;
  const matchingValue =
    matchingValueNumber % 1 !== 0
      ? matchingValueNumber.toFixed(2)
      : matchingValueNumber.toFixed(0);

  return (
    <>
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
              props.errors?.roundMetadata?.quadraticFundingConfig
                ?.matchingCapAmount
            }
            type="number"
            id={"matchingCapAmount"}
            disabled={!isMatchingCap}
            placeholder="Enter matching cap in form of percentage."
            data-testid="matching-cap-percent"
            aria-describedby="percentage-symbol"
            max="100"
            step="any"
            onKeyUp={(e) =>
              e.currentTarget.value !== ""
                ? setMatchingCapAmount(e.currentTarget.value)
                : setMatchingCapAmount(undefined)
            }
          />
        </div>
        {isMatchingCap &&
          props.errors?.roundMetadata?.quadraticFundingConfig
            ?.matchingCapAmount && (
            <p
              className="text-xs text-pink-500"
              data-testid="matching-cap-error"
            >
              {
                props.errors.roundMetadata?.quadraticFundingConfig
                  ?.matchingCapAmount?.message
              }
            </p>
          )}
      </div>
      <div
        className="col-span-6 rounded text-sm bg-gray-50 p-2 text-gray-500"
        hidden={!isMatchingCap}
      >
        A single project can only receive a maximum of {matchingCapAmount} % of
        the matching fund (=
        {matchingValue}{" "}
        {
          props.payoutTokenOptions.find(
            (token) => token.address === props.token
          )?.name
        }
        )
      </div>
    </>
  );
}

function MinDonationThreshold(props: {
  registerMinDonationThreshold: UseFormRegisterReturn<string>; // TODO: add type
  errors: FieldErrors<Round>;
  control?: Control<Round>;
}) {
  const { field: minDonationThresholdField } = useController({
    name: "roundMetadata.quadraticFundingConfig.minDonationThreshold",
    defaultValue: false,
    control: props.control,
    rules: {
      required: true,
    },
  });
  const { value: isMinDonation } = minDonationThresholdField;

  // watch for minDonationAmount
  const amt = useWatch({
    name: "roundMetadata.quadraticFundingConfig.minDonationThresholdAmount",
    control: props.control,
  });
  const [minDonationAmount, setMinDonationAmount] = useState(amt);

  return (
    <>
      <div className="col-span-6 sm:col-span-3">
        <RadioGroup
          {...minDonationThresholdField}
          data-testid="min-donation-selection"
        >
          <RadioGroup.Label className="block text-sm">
            <p className="text-sm">
              <span>
                Do you want a minimum donation <br /> threshold for projects?
              </span>
              <span className="text-right text-violet-400 float-right text-xs mt-1">
                *Required
              </span>
              <InformationCircleIcon
                data-tip
                data-background-color="#0E0333"
                data-for="min-donation-tooltip"
                className="inline h-4 w-4 ml-2 mr-3 mb-1"
                data-testid="min-donation-tooltip"
              />
            </p>
            <ReactTooltip
              id="min-donation-tooltip"
              place="bottom"
              type="dark"
              effect="solid"
            >
              <p className="text-xs">
                Set a minimum amount for each <br />
                donation to be eligible for matching.
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
                    data-testid="min-donation-true"
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
                    data-testid="min-donation-false"
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
        <label htmlFor="minDonationAmount" className="block text-sm">
          <p className="text-sm">
            <span>If so, how much?</span>
            <span className="text-right text-violet-400 float-right text-xs mt-1">
              *Required
            </span>
          </p>
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-400 sm:text-sm">USD</span>
          </div>
          <Input
            className={
              "block w-full rounded-md border-gray-300 pl-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 h-10"
            }
            {...props.registerMinDonationThreshold}
            $hasError={
              isMinDonation &&
              props.errors?.roundMetadata?.quadraticFundingConfig
                ?.matchingCapAmount
            }
            type="number"
            id={"minDonationAmount"}
            disabled={!isMinDonation}
            placeholder="Enter minimum donation amount"
            data-testid="min-donation-amount"
            aria-describedby="dollar-symbol"
            step="any"
            onKeyUp={(e) => {
              setMinDonationAmount(Number(e.currentTarget.value));
            }}
          />
        </div>
        {isMinDonation &&
          props.errors?.roundMetadata?.quadraticFundingConfig
            ?.minDonationThresholdAmount && (
            <p className="text-xs text-pink-500">
              {
                props.errors.roundMetadata?.quadraticFundingConfig
                  ?.minDonationThresholdAmount?.message
              }
            </p>
          )}
      </div>
      <div
        className="col-span-6 rounded text-sm bg-gray-50 p-2 text-gray-500"
        hidden={!isMinDonation}
      >
        Each donation has to be a minimum of ${minDonationAmount} USD equivalent
        for it to be eligible for matching.
      </div>
    </>
  );
}

function SybilDefense(props: {
  registerMatchingCapAmount: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control?: Control<Round>;
}) {
  const { field: sybilDefenseField } = useController({
    name: "roundMetadata.quadraticFundingConfig.sybilDefense",
    defaultValue: false,
    control: props.control,
    rules: {
      required: true,
    },
  });

  return (
    <>
      {" "}
      <div className="col-span-6 sm:col-span-3">
        <RadioGroup
          {...sybilDefenseField}
          data-testid="sybil-defense-selection"
        >
          <div>
            <RadioGroup.Option value={true} className="mb-2">
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
                    data-testid="sybil-defense-true"
                  >
                    Yes, enable Gitcoin Passport (Recommended)
                    <p className="text-xs text-gray-400">
                      Allow matching only for donation from project supporters
                      that have verified their identity on Gitcoin Passport.
                    </p>
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
                    data-testid="sybil-defense-false"
                  >
                    No, disable Gitcoin Passport
                    <p className="text-xs text-gray-400">
                      Allow matching for all donation, including potentially
                      sybil ones.
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
