/* eslint-disable @typescript-eslint/no-explicit-any */
import "react-datetime/css/react-datetime.css";
import {
  Control,
  FieldErrors,
  useController,
  UseFormRegisterReturn,
} from "react-hook-form";
import { Listbox, RadioGroup } from "@headlessui/react";
import { Program } from "../api/types";
import { classNames } from "common";
import moment from "moment";
import { FormInputField } from "../common/FormInputField";
import { FormDropDown } from "../common/FormDropDown";
import { RoundDetails } from "./RoundDetailForm";
import { Datetime } from "../common/Datetime";

export function RoundName(
  props: any
) {
  return (
    <FormInputField
      {...props}
      label="Round Name"
      id="roundName"
      placeholder="Enter round name here."    />
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

export const ContactInformation = (props: any) => (
  <FormInputField
    {...props}
    label="Contact Information"
    id="roundSupport.input"
    placeholder="Enter desired form of contact here. Ex: website, email..."
  />
);

export function Support(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<RoundDetails>;
  control: Control<RoundDetails>;
}) {
  const supportTypes = [
    "Email",
    "Website",
    "Discord Group Invite Link",
    "Telegram Group Invite Link",
    "Google Form Link",
    "Other (please provide a link)",
  ]

  return (
    <FormDropDown
      register={props.register}
      errors={props.errors}
      control={props.control}
      label="Support Input"
      id="roundSupport.type"
      options={supportTypes}
      defaultValue={supportTypes[0]}
    />
  );
}

export function RoundType(props: {
  register: UseFormRegisterReturn<string>;
  control?: Control<RoundDetails>;
}) {
  const { field: roundTypeField } = useController({
    name: "roundVisibility",
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
  control: Control<RoundDetails>;
  name: any;
  label: string;
  date?: moment.Moment;
  setDate?: (date: moment.Moment) => void;  
  minDate?: moment.Moment;
}

// use datetime common component
export function RoundDatetime(props: RoundDatetimeProps) {
  const { control, name, label, date, setDate, minDate } = props;
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
