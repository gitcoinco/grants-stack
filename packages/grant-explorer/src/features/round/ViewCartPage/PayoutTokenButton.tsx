import { PayoutToken } from "../../api/types";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import React from "react";

export function PayoutTokenButton(props: { token?: PayoutToken }) {
  const { token } = props;
  return (
    <Listbox.Button
      className="relative w-[120px] md:w-[130px] cursor-default rounded-md border h-10 border-gray-300 bg-white py-2 pl-3 md:pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs md:text-sm"
      data-testid="payout-token-select"
    >
      <span className="flex items-center">
        {token?.logo ? (
          <img
            src={token?.logo}
            alt="Token Logo"
            className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 rounded-full"
          />
        ) : null}
        {token?.default ? (
          <span className="ml-3 block truncate text-gray-500 text-sm md:text-md">
            {token?.name}
          </span>
        ) : (
          <span className="ml-3 block truncate text-sm md:text-md">
            {token?.name}
          </span>
        )}
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
