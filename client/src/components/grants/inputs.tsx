type InputProps = {
  label: string;
  name: string;
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

type RadioInputProps = {
  name: string;
  value: boolean;
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TextInput(props: InputProps) {
  const { label, name, changeHandler } = props;
  return (
    <div style={{ display: "block" }}>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        style={{ display: "block" }}
        type="text"
        name={name}
        onChange={changeHandler}
      />
    </div>
  );
}

export function RadioInput(props: RadioInputProps) {
  const { name, value, changeHandler } = props;
  return (
    <div style={{ display: "block" }}>
      <input
        type="radio"
        id={name}
        name={name}
        value={String(value)}
        onChange={changeHandler}
      />{" "}
      {value ? "Yes" : "No"}
    </div>
  );
}
