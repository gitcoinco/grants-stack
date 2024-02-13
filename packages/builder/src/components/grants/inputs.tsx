import { Link, Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  AddressInputProps,
  InputProps,
  ProjectOption,
  TextAreaProps,
} from "../../types";
import { getAddressType } from "../../utils/utils";

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
  inputType,
  prefixBoxText,
}: InputProps) {
  const styleInfo = getStyleInfoForFeedback(feedback);
  const { borderClass, feedbackColor } = styleInfo;

  return (
    <div className="relative mt-6 w-full sm:max-w-md">
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
      <div className="flex">
        {Boolean(prefixBoxText) && (
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {" "}
            {prefixBoxText}{" "}
          </span>
        )}
        <input
          type={inputType ?? "text"}
          id={name}
          name={name}
          value={value ?? ""}
          placeholder={placeholder}
          disabled={disabled}
          onChange={changeHandler}
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
      className="relative mt-6 w-full sm:max-w-md"
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
          <span>
            <InformationCircleIcon className="w-6 h-6" color="gray" />
          </span>
        </Tooltip>
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
  const sanitizedInput = (value as string)
    .replace(/(^\w+:|^)\/\//, "")
    .replaceAll(" ", "");

  return (
    <div className="mt-6 w-full sm:max-w-md relative">
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
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          onChange={changeHandler}
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
  const [markdownToolTipOpen, setMarkdownToolTipOpen] = useState(false);
  let borderClass = "";
  let feedbackColor = "";

  if (feedback) {
    const styleInfo = getStyleInfoForFeedback(feedback);
    borderClass = styleInfo.borderClass;
    feedbackColor = styleInfo.feedbackColor;
  }

  const markdownTooltipText = (
    <div
      style={{ pointerEvents: "auto" }}
      onMouseEnter={() => setMarkdownToolTipOpen(true)}
      onMouseLeave={() => setMarkdownToolTipOpen(false)}
      onFocus={() => setMarkdownToolTipOpen(true)}
      onBlur={() => setMarkdownToolTipOpen(false)}
    >
      We now offer rich text support with Markdown. To learn more about how to
      use Markdown, check out{" "}
      <Link
        href="https://www.markdownguide.org/cheat-sheet/"
        target="_blank"
        rel="noreferrer"
        className="cursor-pointer underline"
      >
        this guide
      </Link>
      .
    </div>
  );

  return (
    <div className={`mt-6 w-full sm:max-w-md relative ${containerClass}`}>
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
        {/*  */}
        <span
          onMouseEnter={() => setMarkdownToolTipOpen(true)}
          onMouseLeave={() => setMarkdownToolTipOpen(false)}
          onFocus={() => setMarkdownToolTipOpen(true)}
          onBlur={() => setMarkdownToolTipOpen(false)}
          style={{ paddingBottom: "3px" }}
        >
          <Tooltip
            hasArrow
            closeOnClick
            bg="purple.900"
            className="shrink ml-2 cursor-pointer"
            label={markdownTooltipText}
            isOpen={markdownToolTipOpen}
            onOpen={() => setMarkdownToolTipOpen(true)}
          >
            <InformationCircleIcon className="w-6 h-6" color="gray" />
          </Tooltip>
        </span>
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
  defaultValue?: string;
  options: {
    id: string;
    title: string;
  }[];
};

export function Select({
  label,
  info,
  name,
  options,
  value,
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
        className={classNames(`text-base w-full `, {
          "bg-transparent": !disabled,
          borderClass,
        })}
        onChange={(e) => changeHandler(e)}
        value={value}
        defaultValue={defaultValue}
      >
        {!defaultValue && <option hidden>Choose a value</option>}
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

type ProjectInputProps = InputProps & {
  defaultValue?: number;
  options: ProjectOption[];
};

export function ProjectSelect({
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
}: ProjectInputProps) {
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
