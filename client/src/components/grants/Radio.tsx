type RadioInputProps = {
  label: string;
  name: string;
  value: string | number;
  info?: string;
  choices?: string[];
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Radio({
  label,
  name,
  value,
  info,
  choices = [],
  changeHandler,
}: RadioInputProps) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <legend>{info}</legend>
      <fieldset className="mt-4" id={name}>
        <div className="space-y-2">
          {choices.map((choice) => {
            const choiceId = choice.toLowerCase().replaceAll(" ", "_");
            return (
              <div key={choiceId} className="flex justify-start w-1/2">
                <input
                  value={choice}
                  name={name}
                  checked={choice === value}
                  onChange={changeHandler}
                  type="radio"
                  className="focus:ring-indigo-500 text-indigo-600 border-gray-300 w-4 flex-none"
                />
                <label htmlFor={choiceId} className="ml-3 mb-0">
                  {choice}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
