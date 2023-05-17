import { FC } from "react";
import { Control, useController, UseFormRegisterReturn, FieldErrors } from "react-hook-form";
import { Listbox,Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { Round } from "../api/types";
import _ from "lodash";
import { classNames } from "common";
import { Fragment } from "react";

export const FormDropDown: FC<{
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control: Control<Round>;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;
  options: string[];
  defaultValue: string;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ register, errors, control, label, id, options, defaultValue }) => {
  const errorMessage = _.get(errors, id)?.message;
  const hasError = Boolean(errorMessage);
  const { field } = useController({
    name: id,
    defaultValue: defaultValue,
    control: control,
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
                <span>{label}</span>
                <span className="text-right text-violet-400 float-right text-xs mt-1">
                  *Required
                </span>
              </p>
            </Listbox.Label>
            <div className="mt-1 mb-2 shadow-sm block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <Listbox.Button
                className={`relative w-full cursor-default rounded-md border h-10 bg-white py-2 pl-3 pr-10 text-left shadow-sm ${
hasError
? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
: "border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
}`}
                data-testid={`${id}-testid`}
                id={id}
              >
                <span className="flex items-center">
                  <span className="ml-3 block truncate">{field.value}</span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option}
                      className={({ active }) =>
                        classNames(
                          active ? "text-white bg-indigo-600" : "text-gray-900",
                          "cursor-default select-none relative py-2 pl-10 pr-4"
                        )
                      }
                      value={option}
                      data-testid={`${id}-option-${option}`}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={classNames(
                              selected ? "font-medium" : "font-normal",
                              "block truncate"
                            )}
                          >
                            {option}
                          </span>
                          {selected ? (
                            <span
                              className={classNames(
                                active ? "text-white" : "text-indigo-600",
                                "absolute inset-y-0 left-0 flex items-center pl-3"
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
            {hasError && (
              <p className="mt-2 text-xs text-pink-500">
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
};
