import { Listbox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { TToken, stringToBlobUrl } from "common";
import { Balance } from "../../api/types";

export function PayoutTokenButton(props: {
  token?: TToken;
  balance?: Balance;
  balanceWarning: boolean;
}) {
  const { token, balance } = props;
  return (
    <Listbox.Button
      className="relative w-[250px] md:w-[250px] cursor-default rounded-md border h-10 border-gray-300 bg-white py-2 pl-3 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs md:text-sm"
      data-testid="payout-token-select"
    >
      <span className="flex items-center">
        {token?.icon && (
          <img
            src={stringToBlobUrl(token.icon)}
            alt="Token Logo"
            className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 rounded-full"
          />
        )}
        <span
          className={`ml-2 block truncate text-sm md:text-md ${
            token?.default ? "text-gray-500" : ""
          }`}
        >
          {token?.code}
        </span>
        <span
          className={`ml-3 text-sm ${
            props.balanceWarning ? "text-red-600" : "text-gray-500"
          }`}
        >
          {balance && (
            <div className="flex items-center">
              {props.balanceWarning && (
                <ExclamationCircleIcon className="w-4 mr-2" />
              )}
              Balance: {balance.formattedAmount.toFixed(3)}
            </div>
          )}
        </span>
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
        <ChevronUpDownIcon
          className="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </span>
    </Listbox.Button>
  );
}
