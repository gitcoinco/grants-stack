type RadioInputProps = {
  label: string;
  name: string;
  info?: string;
  choices?: string[];
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Radio({
  label,
  name,
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
          {choices.map((choice, i) => {
            const choiceId = choice.toLowerCase().replaceAll(" ", "_");
            return (
              <div key={choiceId} className="flex justify-start w-1/2">
                <input
                  id={choiceId}
                  name="notification-method"
                  type="radio"
                  defaultChecked={i === 0}
                  className="focus:ring-indigo-500 text-indigo-600 border-gray-300 w-4 flex-none"
                  onChange={changeHandler}
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
