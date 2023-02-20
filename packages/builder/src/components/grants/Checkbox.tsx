import classNames from "classnames";
import { InputProps } from "../../types";
import { Feedback, getStyleInfoForFeedback } from "./inputs";

type CheckboxInputProps = Omit<InputProps, "value" | "changeHandler"> & {
  choices?: string[];
  values: string[];
  required: boolean;
  feedback: Feedback;
  onChange: (newValue: string[]) => void;
};

export default function Checkbox({
  label,
  name,
  values,
  info,
  choices = [],
  onChange,
  required,
  disabled,
  feedback,
}: CheckboxInputProps) {
  const styleInfo = getStyleInfoForFeedback(feedback);
  const { borderClass, feedbackColor } = styleInfo;

  return (
    <div className="mt-6 w-full sm:max-w-md relative">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className="shrink ml-2">
          {required ? (
            <span className="text-sm text-purple-700 inset-y-0 right-0">
              *Required
            </span>
          ) : (
            <span className="text-gray-400 inset-y-0 right-0 text-sm">
              Optional
            </span>
          )}
        </div>
      </div>
      <legend>{info}</legend>
      <fieldset className="mt-4" id={name} disabled={disabled}>
        <div className={classNames("space-y-2 ", borderClass)}>
          {choices.map((choice) => {
            const choiceId = `${name}-${choice
              .toLowerCase()
              .replaceAll(" ", "_")}`;
            return (
              <div key={choiceId} className="flex justify-start w-1/2">
                <input
                  value={choice}
                  name={name}
                  id={choiceId}
                  checked={values.includes(choice)}
                  onChange={(e) => {
                    const newValues = values.filter(
                      (v) => v !== e.target.value
                    );

                    if (e.target.checked) {
                      onChange([...newValues, e.target.value]);
                    } else {
                      onChange(newValues);
                    }
                  }}
                  type="checkbox"
                  className={classNames(
                    "focus:ring-indigo-500 text-indigo-600 border-gray-300 w-4 flex-none"
                  )}
                />
                <label htmlFor={choiceId} className="ml-3 mb-0">
                  {choice}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
      {feedback?.message ? (
        <span className={`text-sm text-${feedbackColor}`}>
          {feedback.message}
        </span>
      ) : null}
    </div>
  );
}
