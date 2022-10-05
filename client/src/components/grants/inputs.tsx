import { Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { AddressInputProps, InputProps, ProjectOption } from "../../types";

const optionalSpan = (
  <span className="text-gray-400 inset-y-0 right-0">Optional</span>
);
const requiredSpan = (
  <span className="text-purple-700 inset-y-0 right-0">*Required</span>
);

export function TextInput({
  label,
  info,
  name,
  value,
  placeholder,
  disabled,
  changeHandler,
  required,
}: InputProps) {
  return (
    <div className="relative mt-6 w-full sm:w-1/2">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className="shrink ml-2">
          {required ? requiredSpan : optionalSpan}
        </div>
      </div>
      <legend>{info}</legend>
      <input
        type="text"
        id={label}
        name={name}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={changeHandler}
      />
    </div>
  );
}

export function TextInputAddress({
  label,
  info,
  name,
  value,
  tooltipValue,
  placeholder,
  disabled,
  changeHandler,
  required,
}: AddressInputProps) {
  return (
    <div className="relative mt-6 w-full sm:w-1/2">
      <div className="flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className="shrink ml-2 mr-2">
          {required ? requiredSpan : optionalSpan}
        </div>
        <Tooltip
          className="shrink ml-2"
          bg="purple.900"
          hasArrow
          label={tooltipValue}
        >
          <InformationCircleIcon className="w-6 h-6" color="gray" />
        </Tooltip>
      </div>
      <legend>{info}</legend>
      <input
        type="text"
        id={label}
        name={name}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={changeHandler}
      />
    </div>
  );
}

export function WebsiteInput({
  label,
  name,
  value,
  disabled,
  info,
  changeHandler,
  required,
}: InputProps) {
  const removeWhiteSpace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const validatedEvent = event;
    validatedEvent.target.value = event.target.value.trim();

    changeHandler(event);
  };
  return (
    <div className="mt-6 w-full sm:w-1/2 relative">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className="shrink ml-2">
          {required ? requiredSpan : optionalSpan}
        </div>
      </div>
      <legend>{info}</legend>
      <div className="flex">
        {/* <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          {" "}
          http://{" "}
        </span> */}
        <input
          type="text"
          className="rounded"
          id={label}
          name={name}
          value={value ?? ""}
          placeholder="https://gitcoin.co/"
          disabled={disabled}
          onChange={removeWhiteSpace}
        />
      </div>
    </div>
  );
}

export function TextArea({
  label,
  info,
  name,
  value,
  placeholder,
  disabled,
  changeHandler,
  required,
}: InputProps) {
  return (
    <div className="mt-6 w-full sm:w-1/2 relative">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className="shrink ml-2">
          {required ? requiredSpan : optionalSpan}
        </div>
      </div>
      <legend>{info}</legend>
      <textarea
        id={label}
        name={name}
        placeholder={placeholder}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => changeHandler(e)}
      />
    </div>
  );
}

type SelectInputProps = InputProps & {
  options: ProjectOption[];
};

export function Select({
  label,
  info,
  name,
  options,
  disabled,
  changeHandler,
  required,
}: SelectInputProps) {
  return (
    <div className="relative">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className="shrink ml-2">
          {required ? requiredSpan : optionalSpan}
        </div>
      </div>
      <legend>{info}</legend>
      <select
        id={name}
        name={name}
        disabled={disabled}
        onChange={(e) => changeHandler(e)}
      >
        {options.map((option) => (
          <option key={`key-${option.id}`} value={option.id}>
            {option.title}
          </option>
        ))}
      </select>
    </div>
  );
}
