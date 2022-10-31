import { InputProps } from "../../types";

type RadioInputProps = InputProps & {
  choices?: string[];
  required: boolean;
};

export default function Radio({
  label,
  name,
  value,
  info,
  choices = [],
  changeHandler,
  required,
  disabled,
}: RadioInputProps) {
  return (
    <div className="mt-6 w-full sm:w-1/2 relative">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className="shrink ml-2">
          {required && (
            <span className="text-purple-700 inset-y-0 right-0">*Required</span>
          )}
        </div>
      </div>
      <legend>{info}</legend>
      <fieldset className="mt-4" id={name} disabled={disabled}>
        <div className="space-y-2">
          {choices.map((choice) => {
            const choiceId = choice.toLowerCase().replaceAll(" ", "_");
            return (
              <div key={choiceId} className="flex justify-start w-1/2">
                <input
                  value={choice}
                  name={name}
                  id={choiceId}
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
