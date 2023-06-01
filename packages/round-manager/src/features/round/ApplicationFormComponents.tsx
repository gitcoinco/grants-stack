import "react-datetime/css/react-datetime.css";
import {
  Control,
  FieldErrors,
  useController,
  UseFormRegisterReturn,
  useWatch,
} from "react-hook-form";
import { Listbox, RadioGroup } from "@headlessui/react";
import { Program } from '../api/types';
import { classNames } from "common";
import moment from "moment";
import { FormInputField } from "../common/FormInputField";
import { FormDropDown } from "../common/FormDropDown";
import { RoundDetailFormFields } from "./RoundDetailForm";
import { Datetime } from "../common/Datetime";
import { QuadraticFundingFormFields } from "./QuadraticFundingForm";
import { RadioOption } from "../common/RadioOption";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { FC, useState } from "react";
import ReactTooltip from "react-tooltip";
import { PayoutToken } from '../api/utils';
import { RoundDetailsEditFormFields } from "./ViewRoundSettings";

interface RoundNameProps {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<RoundDetailFormFields>;
  disabled?: boolean;
}

export const RoundName: FC<RoundNameProps> = ({
  register,
  errors,
  disabled,
}) => {
  return (
  <FormInputField<RoundDetailFormFields>
      register={register}
      errors={errors}
      label="Round Name"
      id="roundName"
      placeholder="Enter round name here."    
      disabled={disabled}
    />
  );
}

interface ProgramChainProps {
  label: string | undefined;
  logo: string | undefined; 
}

export const ProgramChain: FC<ProgramChainProps> = ({
  label,
  logo
}) => {
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
                {logo && (
                  <img
                    src={logo}
                    alt="chain logo"
                    data-testid="chain-logo"
                    className="h-5 w-5 flex-shrink-0 rounded-full"
                  />
                )}
                {
                  <span className="ml-3 block truncate">
                    {label}
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

interface ContactInformationProps {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<RoundDetailFormFields>;
  disabled?: boolean;
}

export const ContactInformation: FC<ContactInformationProps> = ({
  register,
  errors,
  disabled,
}) => (
  <FormInputField<RoundDetailFormFields>
    register={register}
    errors={errors}
    label="Contact Information"
    id="roundSupport.input"
    placeholder="Enter desired form of contact here. Ex: website, email..."
    disabled={disabled}
  />
);

interface SupportProps {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<RoundDetailFormFields | any>;
  control: Control<RoundDetailFormFields | any>;
  disabled?: boolean;
}

export const Support: FC<SupportProps> = ({
  register,
  errors,
  control,
  disabled,
}) => {
  const supportTypes = [
    {name: "Email"},
    {name: "Website"},
    {name: "Discord Group Invite Link"},
    {name: "Telegram Group Invite Link"},
    {name: "Google Form Link"},
    {name: "Other (please provide a link)"},
  ]

  return (
    <FormDropDown
      register={register}
      errors={errors}
      control={control}
      label="Support Input"
      id="roundSupport.type"
      options={supportTypes}
      defaultValue={supportTypes[0]}
      disabled={disabled}
    />
  );
}

interface RoundTypeProps {
  register: UseFormRegisterReturn<string>;
  control: Control<RoundDetailFormFields>;
}

export const RoundType: FC<RoundTypeProps> = ({
  control,
}) => {
  const { field: roundTypeField } = useController({
    name: "roundVisibility",
    control: control,
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
                    data-testid="round-type-public"
                  >
                    Yes, make my round public
                    <p className="text-xs text-gray-400">
                      Anyone on the Gitcoin Explorer homepage will be able to
                      see your round
                    </p>
                  </RadioGroup.Label>
                </span>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value="private">
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
                    data-testid="round-type-private"
                  >
                    No, keep my round private
                    <p className="text-xs text-gray-400">
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

interface RoundDatetimeProps {
  control: Control<RoundDetailFormFields>;
  name: unknown;
  label: string;
  date?: moment.Moment;
  setDate?: (date: moment.Moment) => void;  
  minDate?: moment.Moment;
}

// use datetime common component
export const RoundDatetime: FC<RoundDatetimeProps> = ({
  control,
  name,
  label,
  date,
  setDate,
  minDate,
}) => {
  return (
    <div className="col-span-6 sm:col-span-3">
      <Datetime
        control={control}
        name={name}
        label={label}
        date={date}
        setDate={setDate}
        minDate={minDate}
      />
    </div>
  );
}

interface SybilDefenseProps {
  control?: Control<QuadraticFundingFormFields | any>;
  disabled?: boolean;
}

export const SybilDefense: FC<SybilDefenseProps> = ({
  control,
  disabled,
}) => {
  const { field: sybilDefenseField } = useController({
    name: "sybilDefenseEnabled",
    defaultValue: false,
    control: control,
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
            <RadioOption
              value={true}
              label="Yes, enable Gitcoin Passport (Recommended)"
              description="Allow matching only for donation from project supporters
                           that have verified their identity on Gitcoin Passport."
              checked={true}
              active={true}
              testid="sybil-defense-true"
              disabled={disabled}
            />
            <RadioOption
              value={false}
              label="No, disable Gitcoin Passport"
              description="Allow matching for all donation, including potentially
                           sybil ones."
              checked={false}
              active={true}
              testid="sybil-defense-false"
              disabled={disabled}
            />
          </div>
        </RadioGroup>
      </div>
    </>
  );
}

interface MinDonationThresholdProps {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<QuadraticFundingFormFields | any>;
  control?: Control<QuadraticFundingFormFields | any>;
  disabled?: boolean;
}

export const MinDonationThreshold: FC<MinDonationThresholdProps> = ({ register, errors, control, disabled }) => {
  const { field: minDonationThresholdField } = useController({
    name: "minDonationThreshold",
    defaultValue: false,
    control: control,
    rules: {
      required: true,
    },
  });
  const { value: isMinDonation } = minDonationThresholdField;

  const amt = useWatch({
    name: "minDonationThresholdAmount",
    control: control,
  });
  const [minDonationAmount, ] = useState(amt);

  return (
    <>
      <div className="col-span-6 sm:col-span-3">
        <RadioGroup
          {...minDonationThresholdField}
          data-testid="min-donation-selection"
        >
          <RadioGroup.Label className="block text-sm">
            <p className="text-sm">
              Do you want a minimum donation threshold for projects?
              <span className="text-right text-violet-400 float-right text-xs mt-1">*Required</span>
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
              Set a minimum amount for each donation to be eligible for matching.
            </ReactTooltip>
          </RadioGroup.Label>
          <div className="flex flex-row gap-4 mt-3">
            <RadioOption
              value={true}
              label="Yes"
              checked={false}
              active={true}
              testid="min-donation-true" 
              description={""}
              disabled={disabled}
            />
            <RadioOption
              value={false}
              label="No"
              checked={true}
              active={true}
              testid="min-donation-false" 
              description={""}
              disabled={disabled}   
            />
          </div>
        </RadioGroup>
      </div>
      <FormInputField
        register={register}
        errors={errors}
        label="If so, how much?"
        id="minDonationThresholdAmount"
        placeholder="Enter minimum donation amount"
        disabled={!isMinDonation}
      />
      <div
        className="col-span-6 rounded text-sm bg-gray-50 p-2 text-gray-500"
        hidden={!isMinDonation}
      >
        Each donation has to be a minimum of ${minDonationAmount} USD equivalent
        for it to be eligible for matching.
      </div>
    </>
  );
};

interface MatchingCapProps {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<QuadraticFundingFormFields | any>;
  control?: Control<QuadraticFundingFormFields | any>;
  token: string;
  payoutTokenOptions: PayoutToken[];
  disabled?: boolean;
}

export const MatchingCap: FC<MatchingCapProps> = ({ register, errors, control, disabled }) => {
  const { field: matchingCap } = useController({
    name: "matchingCap",
    defaultValue: false,
    control: control,
    rules: {
      required: true,
    },
  });
  
  const amt = useWatch({
    name: "matchingCapAmount",
    control: control,
  });

  const isMatchingCap = useWatch({
    name: "matchingCap",
    control: control,
  });

  const [matchingCapAmount, ] = useState<
    string | undefined
  >(amt?.toString());

  return (
    <>
      <div className="col-span-6 sm:col-span-3">
        <RadioGroup
          {...matchingCap}
          data-testid="matching-cap-selection"
        >
          <RadioGroup.Label className="block text-sm">
            <p className="text-sm">
              Do you want a matching cap for projects?
              <span className="text-right text-violet-400 float-right text-xs mt-1">*Required</span>
              <InformationCircleIcon
                data-tip
                data-background-color="#0E0333"
                data-for="matching-cap-tooltip"
                className="inline h-4 w-4 ml-2 mr-3 mb-1"
                data-testid="matching-cap-tooltip"
              />
            </p>
            <ReactTooltip
              id="matching-cap-tooltip"
              place="bottom"
              type="dark"
              effect="solid"
            >
              This will cap the percentage <br />
            of your overall matching pool <br />
            that a single grantee can receive
            </ReactTooltip>
          </RadioGroup.Label>
          <div className="flex flex-row gap-4 mt-3">
            <RadioOption
              value={true}
              label="Yes"
              checked={false}
              active={true}
              testid="matching-cap-true" 
              description={""}  
              disabled={disabled}         
            />
            <RadioOption
              value={false}
              label="No"
              checked={true}
              active={true}
              testid="matching-cap-false" 
              description={""}
              disabled={disabled}
            />
          </div>
        </RadioGroup>
      </div>
      <FormInputField
        register={register}
        errors={errors}
        label="If so, how much?"
        id="matchingCapAmount"
        placeholder="Enter matching cap amount"
        disabled={!isMatchingCap}
      />
      <div
        className="col-span-6 rounded text-sm bg-gray-50 p-2 text-gray-500"
        hidden={!isMatchingCap}
      >
        Each donation has to be a minimum of ${matchingCapAmount} USD equivalent
        for it to be eligible for matching.
      </div>
    </>
  );
};

interface MatchingFundsAvailableProps {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<QuadraticFundingFormFields | any>;
  token: string;
  payoutTokenOptions: PayoutToken[];
  disabled?: boolean;
}

export const MatchingFundsAvailable: FC<MatchingFundsAvailableProps> = ({
  register,
  errors,
  disabled,
}) => {
  return (
  <FormInputField<QuadraticFundingFormFields>
      register={register}
      errors={errors}
      label="Matching Funds Available"
      id="matchingFundsAvailable"
      placeholder="Enter the amount in the chosen payout token" 
      disabled={disabled}   
    />
  );
}

interface PayoutTokenDropdownProps {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<QuadraticFundingFormFields | RoundDetailsEditFormFields | any >;
  control: Control<QuadraticFundingFormFields | RoundDetailsEditFormFields| any >;
  payoutTokenOptions: PayoutToken[];
  disabled?: boolean;
  defaultValue?: PayoutToken;
}

export const PayoutTokenDropdown: FC<PayoutTokenDropdownProps> = ({
  register,
  errors,
  control,
  payoutTokenOptions,
  defaultValue,
  disabled,
}) => {
  return (
    <FormDropDown
      register={register}
      errors={errors}
      control={control}
      label="Payout Token"
      id="token"
      options={payoutTokenOptions}
      defaultValue={defaultValue}
      disabled={disabled}
    />
  );
}