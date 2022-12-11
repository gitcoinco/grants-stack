import classNames from "classnames";
import { InputProps } from "../../types";
import { Feedback, getStyleInfoForFeedback } from "./inputs";

type RadioInputProps = InputProps & {
  choices?: string[];
  required: boolean;
  feedback: Feedback;
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
  feedback,
}: RadioInputProps) {
  const styleInfo = getStyleInfoForFeedback(feedback);
  const { borderColor, feedbackColor } = styleInfo;

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
                  className={classNames(
                    "focus:ring-indigo-500 text-indigo-600 border-gray-300 w-4 flex-none",
                    borderColor ?? `border-${borderColor}`
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
