type InputProps = {
  label: string;
  name: string;
  value?: string;
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

type RadioInputProps = {
  name: string;
  value: boolean;
  existingValue?: boolean;
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TextInput(props: InputProps) {
  const { label, name, value, changeHandler } = props;
  return (
    <div style={{ display: "block" }}>
      <label htmlFor={label}>{label}</label>
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id={label}
        style={{ display: "block" }}
        type="text"
        name={name}
        value={value ?? ""}
        onChange={changeHandler}
      />
    </div>
  );
}

export function RadioInput(props: RadioInputProps) {
  const { name, value, existingValue, changeHandler } = props;
  return (
    <div style={{ display: "block" }}>
      <input
        type="radio"
        id={String(value)}
        name={name}
        value={String(existingValue)}
        onChange={changeHandler}
      />{" "}
      {value ? "Yes" : "No"}
    </div>
  );
}
