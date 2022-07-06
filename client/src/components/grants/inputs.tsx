import { InputProps, RadioInputProps } from "../../types";

export function TextInput({
  label,
  name,
  value,
  placeholder,
  changeHandler,
}: InputProps) {
  return (
    <div className="mt-6 w-full sm:w-1/2">
      <label className="block text-xs mb-2" htmlFor={label}>
        {label}
      </label>
      <input
        type="text"
        id={label}
        name={name}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={changeHandler}
      />
    </div>
  );
}

export function RadioInput({
  name,
  value,
  currentValue,
  changeHandler,
}: RadioInputProps) {
  return (
    <div style={{ display: "block" }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={value === currentValue}
        onChange={changeHandler}
      />{" "}
      {value}
    </div>
  );
}

export function WebsiteInput({
  label,
  name,
  value,
  changeHandler,
}: InputProps) {
  return (
    <div className="mt-6 w-full sm:w-2/3">
      <label htmlFor={name} className="block text-xs mb-2">
        {" "}
        {label}{" "}
      </label>
      <div className="mt-1 flex">
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
          onChange={changeHandler}
        />
      </div>
    </div>
  );
}

export function TextArea({
  label,
  name,
  value,
  placeholder,
  changeHandler,
}: InputProps) {
  return (
    <div className="mt-6">
      <label className="block text-xs mb-2" htmlFor={label}>
        {label}
      </label>
      <textarea
        id={label}
        name={name}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => changeHandler(e)}
      />
    </div>
  );
}
