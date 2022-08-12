import { InputProps, ProjectOption } from "../../types";

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
    <div className="mt-6 w-full sm:w-1/2">
      <label className="text-sm" htmlFor={name}>
        {label}
      </label>
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
    <div className="mt-6">
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
    <div>
      <label className="text-sm" htmlFor={name}>
        {label}
      </label>
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
