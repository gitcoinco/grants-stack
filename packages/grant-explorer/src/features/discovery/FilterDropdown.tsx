import { Fragment } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Transition, Disclosure } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

import { Dropdown, DropdownItem } from "../common/Dropdown";
import { toQueryString } from "./RoundsFilter";
import {
  RoundFilterUiOption,
  RoundStatus,
  getRoundSelectionParamsFromUrlParams,
} from "./hooks/useFilterRounds";
import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE } from "common";
import { getFilterLabel } from "./utils/getFilterLabel";
import { getEnabledChains } from "../../app/chainConfig";

export const FILTER_OPTIONS: RoundFilterUiOption[] = [
  {
    label: "All",
    value: "",
    children: [],
  },
  {
    label: "Type",
    value: "type",
    children: [
      {
        label: "Quadratic funding",
        value: ROUND_PAYOUT_MERKLE,
      },
      {
        label: "Direct grants",
        value: ROUND_PAYOUT_DIRECT,
      },
    ],
  },

  {
    label: "Status",
    value: "status",
    children: [
      {
        label: "Active",
        value: RoundStatus.active,
      },
      {
        label: "Taking applications",
        value: RoundStatus.taking_applications,
      },
      {
        label: "Finished",
        value: RoundStatus.finished,
      },
    ],
  },
  {
    label: "Network",
    value: "network",
    children: getEnabledChains().map(({ id, name }) => ({
      label: `Rounds on ${name}`,
      value: String(id),
    })),
  },
];

export function FilterDropdown() {
  const [params] = useSearchParams();

  const filter = getRoundSelectionParamsFromUrlParams(params);
  const { status = "", type = "", network = "" } = filter;

  const selected = getFilterLabel({ status, type, network });
  return (
    <Dropdown
      label={selected?.label}
      options={FILTER_OPTIONS}
      keepOpen
      renderItem={({ label, value: filterKey, children, close }) => {
        // Filters can be multi selected (ie many networks)
        const selectedFilter =
          { status, type, network }[filterKey]?.split(",").filter(Boolean) ??
          [];

        if (!children?.length) {
          return (
            <DropdownItem
              $as={Link}
              to={`/rounds?${toQueryString({
                ...Object.fromEntries(params),
                network: "",
                status: "",
                type: "",
              })}`}
              preventScrollReset
              onClick={() => close()}
            >
              {label}
            </DropdownItem>
          );
        }
        return (
          <Disclosure defaultOpen={Boolean(selectedFilter.length)}>
            <div className="relative mt-1">
              <Disclosure.Button className="relative w-[340px] py-2 pl-3 pr-10 text-left hover:bg-grey-100">
                {({ open }) => {
                  const Icon = open ? ChevronUpIcon : ChevronDownIcon;
                  return (
                    <>
                      <span className="block truncate">{label}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <Icon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </>
                  );
                }}
              </Disclosure.Button>

              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Disclosure.Panel
                  static
                  className=" mt-1 w-full overflow-auto p-2"
                >
                  {children
                    ?.filter((child) => !child.hide)
                    .map((child, j) => {
                      const isChecked = selectedFilter?.includes(child.value);

                      const nextValue = isChecked
                        ? // Remove or add the value
                          selectedFilter?.filter((f) => f !== child.value)
                        : selectedFilter?.concat(child.value);
                      return (
                        <DropdownItem
                          key={j}
                          $as={Link}
                          to={`/rounds?${toQueryString({
                            // Merge existing search params (so it doesn't reset sorting or the other selections)
                            ...filter,
                            [filterKey]: nextValue.join(","),
                          })}`}
                        >
                          <div className="flex gap-2">
                            <input type="checkbox" checked={isChecked} />
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {child.label}
                            </span>
                          </div>
                        </DropdownItem>
                      );
                    })}
                </Disclosure.Panel>
              </Transition>
            </div>
          </Disclosure>
        );
      }}
    ></Dropdown>
  );
}
