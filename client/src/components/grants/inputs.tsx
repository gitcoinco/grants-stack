import { Tooltip } from "@chakra-ui/react";
import { AddressInputProps, InputProps, ProjectOption } from "../../types";

export function TextInput({
  label,
  info,
  name,
  value,
  placeholder,
  disabled,
  changeHandler,
}: InputProps) {
  return (
    <div className="relative mt-6 w-full sm:w-1/2">
      <label className="text-sm" htmlFor={name}>
        {label}
      </label>
      <span className="absolute text-purple-700 inset-y-0 right-0">
        * required
      </span>
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
  displayError, // a string that will be: (visible | invisible)
}: AddressInputProps) {
  // todo: validate address

  return (
    <div className="mt-6 w-full sm:w-1/2 static">
      <label className="text-sm absolute" htmlFor={name}>
        {label}
      </label>
      <Tooltip bg="purple.600" hasArrow label={tooltipValue}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 ml-32"
        >
          <path
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 
              11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </Tooltip>
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
      <span className={`text-red-500 ${displayError}`}>
        This is not a valid payment address
      </span>
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
}: InputProps) {
  const removeWhiteSpace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const validatedEvent = event;
    validatedEvent.target.value = event.target.value.trim();

    changeHandler(event);
  };
  return (
    <div className="mt-6 w-full sm:w-2/3">
      <label className="text-sm" htmlFor={name}>
        {" "}
        {label}{" "}
      </label>
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
}: InputProps) {
  return (
    <div className="mt-6 w-full sm:w-1/2">
      <label className="text-sm" htmlFor={name}>
        {label}
      </label>
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
}: SelectInputProps) {
  return (
    <div className="relative">
      <label className="text-sm" htmlFor={name}>
        {label}
      </label>
      <span className="absolute text-purple-700 inset-y-0 right-1/2">
        * required
      </span>
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
