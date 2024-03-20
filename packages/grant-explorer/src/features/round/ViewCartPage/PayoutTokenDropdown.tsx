import { Listbox, Transition } from "@headlessui/react";
import { PayoutTokenButton } from "./PayoutTokenButton";
import React, { Fragment } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { classNames, NATIVE, VotingToken } from "common";

export function PayoutTokenDropdown(props: {
  payoutTokenOptions: VotingToken[];
  selectedPayoutToken?: VotingToken;
  setSelectedPayoutToken: (payoutToken: VotingToken) => void;
}) {
  return (
    <div className="mt-1 relative col-span-6 sm:col-span-3">
      <Listbox
        value={props.selectedPayoutToken}
        onChange={props.setSelectedPayoutToken}
      >
        {({ open }) => (
          <div>
            <div className="mb-2 shadow-sm block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <PayoutTokenButton
                token={props.payoutTokenOptions.find(
                  (t) => t.address === props.selectedPayoutToken?.address
                )}
              />
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {props.payoutTokenOptions
                    .filter((t) => t.address !== NATIVE)
                    .map(
                      (token) =>
                        !token.default && (
                          <Listbox.Option
                            key={token.name}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? "text-white bg-indigo-600"
                                  : "text-gray-900",
                                "relative cursor-default select-none py-2 pl-3 pr-9"
                              )
                            }
                            value={token}
                            data-testid="payout-token-option"
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  {token.logo ? (
                                    <img
                                      src={token.logo}
                                      alt=""
                                      className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 rounded-full"
                                    />
                                  ) : null}
                                  <span
                                    className={classNames(
                                      selected
                                        ? "font-semibold"
                                        : "font-normal",
                                      "ml-3 block truncate"
                                    )}
                                  >
                                    {token.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? "text-white" : "text-indigo-600",
                                      "absolute inset-y-0 right-0 flex items-center pr-4"
                                    )}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        )
                    )}
                </Listbox.Options>
              </Transition>
            </div>
          </div>
        )}
      </Listbox>
    </div>
  );
}
