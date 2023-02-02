import { Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { ethers } from "ethers";
import { useEffect } from "react";
import { getAddressType } from "../../utils/utils";
import {
  AddressInputProps,
  InputProps,
  TextAreaProps,
  ProjectOption,
} from "../../types";

const optionalSpan = (
  <span className="text-gray-400 inset-y-0 right-0 text-sm">Optional</span>
);
const requiredSpan = (
  <span className="text-purple-700 inset-y-0 right-0 text-sm">*Required</span>
);

const encryptionTooltipLabel =
  "Your personal data will be encrypted when you submit your application, and will only be decrypted by the team reviewing your application.";

const encryptionTooltip = (
  <Tooltip
    className="shrink ml-2"
    bg="purple.900"
    hasArrow
    label={encryptionTooltipLabel}
  >
    <InformationCircleIcon className="w-6 h-6" color="gray" />
  </Tooltip>
);

export type Feedback = {
  type: string;
  message: string;
};

export type FeedbackStyle = {
  borderClass: string;
  feedbackColor: string;
};

export function getStyleInfoForFeedback(feedback: Feedback): FeedbackStyle {
  switch (feedback?.type) {
    case "error":
      return {
        borderClass: "input-error",
        feedbackColor: "gitcoin-pink-500",
      };
    case "success":
      return {
        borderClass: "input-success",
        feedbackColor: "green-text",
      };
    case "warning":
      return {
        borderClass: "input-warning",
        feedbackColor: "gitcoin-yellow",
      };
    default:
      return {
        borderClass: "",
        feedbackColor: "",
      };
  }
}

export function TextInput({
  label,
  info,
  name,
  value,
  placeholder,
  disabled,
  changeHandler,
  required,
  encrypted,
  tooltip,
  feedback,
}: InputProps) {
  const styleInfo = getStyleInfoForFeedback(feedback);
  const { borderClass, feedbackColor } = styleInfo;

  return (
    <div className="relative mt-6 w-full sm:w-1/2">
      <div className="flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            <span>{label}</span>
            {tooltip && (
              <Tooltip
                className="shrink"
                bg="purple.900"
                hasArrow
                label={tooltip}
              >
                <InformationCircleIcon
                  className="w-4 h-4 inline ml-1"
                  color="gray"
                />
              </Tooltip>
            )}
          </label>
        </div>
        <div className={classNames("shrink ml-2", { "mr-2": encrypted })}>
          {required ? requiredSpan : optionalSpan}
        </div>
        {encrypted && encryptionTooltip}
      </div>
      <legend>{info}</legend>
      <input
        type="text"
        id={name}
        name={name}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={changeHandler}
        className={borderClass}
      />
      {feedback?.message ? (
        <span className={`text-sm text-${feedbackColor}`}>
          {feedback.message}
        </span>
      ) : null}
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
  required,
  encrypted,
  onAddressType,
  warningHighlight,
  feedback,
}: AddressInputProps) {
  const styleInfo = getStyleInfoForFeedback(feedback);
  const { borderClass, feedbackColor } = styleInfo;
  const verificationHandler = async () => {
    if (onAddressType) {
      if (typeof value === "string" && ethers.utils.isAddress(value)) {
        const addressType = await getAddressType(value);
        onAddressType(addressType);
      } else {
        onAddressType();
      }
    }
  };

  useEffect(() => {
    verificationHandler();
  }, [value]);

  return (
    <div
      className="relative mt-6 w-full sm:w-1/2"
      data-testid="address-input-wrapper"
    >
      <div className="flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className="shrink ml-2 mr-2">
          {required ? requiredSpan : optionalSpan}
        </div>
        <Tooltip
          className="shrink ml-2"
          bg="purple.900"
          hasArrow
          label={`${
            encrypted ? `${encryptionTooltipLabel} \n` : ""
          } ${tooltipValue}`}
        >
          <InformationCircleIcon className="w-6 h-6" color="gray" />
        </Tooltip>
      </div>
      <legend>{info}</legend>
      <input
        type="text"
        id={label}
        name={name}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={changeHandler}
        className={classNames(borderClass, {
          "border border-gitcoin-yellow-500": warningHighlight,
        })}
      />
      {feedback?.message ? (
        <span className={`text-sm text-${feedbackColor}`}>
          {feedback.message}
        </span>
      ) : null}
    </div>
  );
}

export function WebsiteInput({
  label,
  name,
  value = "",
  disabled,
  info,
  placeholder,
  changeHandler,
  required,
  encrypted,
  feedback,
}: InputProps) {
  const styleInfo = getStyleInfoForFeedback(feedback);
  const { borderClass, feedbackColor } = styleInfo;

  const removeWhiteSpace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const validatedEvent = event;
    validatedEvent.target.value = `https://${event.target.value.trim()}`;

    changeHandler(event);
  };

  const sanitizedInput = (value as string).replace(/(^\w+:|^)\/\//, "");

  return (
    <div className="mt-6 w-full sm:w-1/2 relative">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className={classNames("shrink ml-2", { "mr-2": encrypted })}>
          {required ? requiredSpan : optionalSpan}
        </div>
        {encrypted && encryptionTooltip}
      </div>
      <legend>{info}</legend>
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          {" "}
          https://{" "}
        </span>
        <input
          type="text"
          id={name}
          name={name}
          value={sanitizedInput ?? ""}
          placeholder={placeholder}
          disabled={disabled}
          onChange={removeWhiteSpace}
          className={borderClass}
        />
      </div>
      {feedback?.message ? (
        <span className={`text-sm text-${feedbackColor}`}>
          {feedback.message}
        </span>
      ) : null}
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
  required,
  encrypted,
  feedback,
  containerClass,
  rows,
}: TextAreaProps) {
  let borderClass = "";
  let feedbackColor = "";

  if (feedback) {
    const styleInfo = getStyleInfoForFeedback(feedback);
    borderClass = styleInfo.borderClass;
    feedbackColor = styleInfo.feedbackColor;
  }

  return (
    <div className={`mt-6 w-full sm:w-1/2 relative ${containerClass}`}>
      <div className="flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className={classNames("shrink ml-2", { "mr-2": encrypted })}>
          {required ? requiredSpan : optionalSpan}
        </div>
        {encrypted && encryptionTooltip}
      </div>
      <legend>{info}</legend>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => changeHandler(e)}
        className={borderClass}
      />
      {feedback?.message ? (
        <span className={`text-sm text-${feedbackColor}`}>
          {feedback.message}
        </span>
      ) : null}
    </div>
  );
}

type SelectInputProps = InputProps & {
  defaultValue?: number;
  options: ProjectOption[];
};

export function Select({
  label,
  info,
  name,
  options,
  disabled,
  changeHandler,
  required,
  encrypted,
  defaultValue,
  feedback,
}: SelectInputProps) {
  let borderClass = "";
  let feedbackColor = "";

  if (feedback) {
    const styleInfo = getStyleInfoForFeedback(feedback);
    borderClass = styleInfo.borderClass;
    feedbackColor = styleInfo.feedbackColor;
  }

  return (
    <div className="relative">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className={classNames("shrink ml-2", { "mr-2": encrypted })}>
          {required ? requiredSpan : optionalSpan}
        </div>
        {encrypted && encryptionTooltip}
      </div>
      <legend>{info}</legend>
      <select
        id={name}
        name={name}
        disabled={disabled}
        className={classNames(`w-full `, {
          "bg-transparent": !disabled,
          borderClass,
        })}
        onChange={(e) => changeHandler(e)}
        defaultValue={defaultValue}
      >
        {options.map((option) => (
          <option key={`key-${option.id}`} value={option.id}>
            {option.title}
          </option>
        ))}
      </select>
      {feedback?.message ? (
        <span className={`text-sm text-${feedbackColor}`}>
          {feedback.message}
        </span>
      ) : null}
    </div>
  );
}

export function CustomSelect({
  label,
  info,
  name,
  options,
  disabled,
  changeHandler,
  required,
  encrypted,
  defaultValue,
  feedback,
}: SelectInputProps) {
  let borderClass = "";
  let feedbackColor = "";

  if (feedback) {
    const styleInfo = getStyleInfoForFeedback(feedback);
    borderClass = styleInfo.borderClass;
    feedbackColor = styleInfo.feedbackColor;
  }

  return (
    <div className="relative">
      <div className=" flex">
        <div className="grow">
          <label className="text-sm w-full" htmlFor={name}>
            {label}
          </label>
        </div>
        <div className={classNames("shrink ml-2", { "mr-2": encrypted })}>
          {required ? requiredSpan : optionalSpan}
        </div>
        {encrypted && encryptionTooltip}
      </div>
      <legend>{info}</legend>
      <select
        id={name}
        name={name}
        disabled={disabled}
        className={classNames(
          "w-full",
          {
            "bg-transparent": !disabled,
          },
          borderClass
        )}
        onChange={(e) => changeHandler(e)}
        defaultValue={defaultValue}
      >
        {options.map((option) => {
          const { chainInfo, title, id } = option;
          const chainName = chainInfo?.chainName ?? null;
          const displayValue = chainName ? `${title} (${chainName})` : title;
          return (
            <option key={`key-${id}`} value={id}>
              {displayValue}
            </option>
          );
        })}
      </select>
      {feedback?.message ? (
        <span className={`text-sm text-${feedbackColor}`}>
          {feedback.message}
        </span>
      ) : null}
    </div>
  );
}
