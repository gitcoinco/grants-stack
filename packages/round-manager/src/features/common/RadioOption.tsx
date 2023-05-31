import { FC } from "react";
import { RadioGroup } from "@headlessui/react";

const classNames = (...classes: string[]) => classes.filter(Boolean).join(' ');

export const RadioOption: FC<{
  value: boolean;
  label: string;
  description: string;
  checked: boolean;
  active: boolean;
  testid: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}> = ({ value, label, description, checked, active, testid, disabled }) => (
  <RadioGroup.Option value={value} className="mb-2" disabled={disabled}>
    {({ checked, active }) => (
      <span className="flex items-center text-sm">
        <span
          className={classNames(
            checked
              ? "bg-indigo-600 border-transparent"
              : "bg-white border-gray-300",
            active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
            "h-4 w-4 rounded-full border flex items-center justify-center", 
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          )}
          aria-hidden="true"
        >
          <span className="rounded-full bg-white w-1.5 h-1.5" />
        </span>
        <RadioGroup.Label
          as="span"
          className="ml-3 block text-sm text-gray-700"
          data-testid={testid}
        >
          {label}
          <p className="text-xs text-gray-400">{description}</p>
        </RadioGroup.Label>
      </span>
    )}
  </RadioGroup.Option>
);

