import { Fragment } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Transition, Listbox } from "@headlessui/react";
import {
  ChevronDownIcon,
  CheckIcon,
  ChevronUpIcon,
} from "@heroicons/react/20/solid";

import { CHAINS } from "../api/utils";
import { Dropdown, DropdownItem } from "../common/Dropdown";
import { toQueryString } from "./RoundsFilter";
import { parseFilterParams } from "./hooks/useFilterRounds";
import { ROUND_PAYOUT_DIRECT, ROUND_PAYOUT_MERKLE } from "common";

type Option = {
  label: string;
  value: string;
  children?: Option[];
};

export enum FilterStatus {
  active = "active",
  taking_applications = "taking_applications",
  finished = "finished",
}
const filterOptions: Option[] = [
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
        value: FilterStatus.active,
      },
      {
        label: "Taking applications",
        value: FilterStatus.taking_applications,
      },
      {
        label: "Finished",
        value: FilterStatus.finished,
      },
    ],
  },
  {
    label: "Network",
    value: "network",
    children: Object.entries(CHAINS).map(([value, { name }]) => ({
      label: `Rounds on ${name}`,
      value,
    })),
  },
];

export type FilterProps = {
  type: string;
  status: string;
  network: string;
};

/* 
Find the label to display from the current filter.
- All - nothing selected
- Multiple - more than 1 selected
- Selected - 1 selected
*/
export function getLabel(filter: FilterProps): Option {
  return (
    // Convert { key: val } to [[key, val]] and remove empty values
    Object.entries(filter)
      .filter(([, val]) => Boolean(val))
      .reduce(
        (acc, [key, val], _, arr) => {
          // More than 1 filter is selected
          if (arr.length > 1) return { label: "Multiple", value: "" };

          // Find the selected option
          const selected =
            filterOptions
              .find((opt) => opt.value === key)
              ?.children?.find((c) => c.value === val) || acc;

          return selected;
        },
        // Initialize with label: All
        filterOptions[0]
      )
  );
}
export function FilterDropdown() {
  const [params] = useSearchParams();

  const filter = parseFilterParams(params);
  const selected = getLabel(filter);

  const { status, type, network } = filter;

  return (
    <Dropdown
      label={selected?.label}
      options={filterOptions}
      renderItem={({ active, label, value: filterKey, children }) => {
        if (!children?.length) {
          return (
            <DropdownItem active={active} $as={Link} to={`/rounds`}>
              {label}
            </DropdownItem>
          );
        }
        return (
          <Listbox value={selected}>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-[340px] py-2 pl-3 pr-10 text-left hover:bg-grey-100">
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
              </Listbox.Button>

              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className=" mt-1 w-full overflow-auto p-2">
                  {children?.map((child, j) => {
                    // Filters can be multi selected (ie many networks)
                    const selectedFilter =
                      { status, type, network }[filterKey]?.split(",") ?? [];

                    const isChecked = selectedFilter?.includes(child.value);

                    const nextValue = isChecked
                      ? // Remove or add the value
                        selectedFilter?.filter((f) => f !== child.value)
                      : selectedFilter?.concat(child.value);
                    return (
                      <Listbox.Option key={j} value={child}>
                        {({ active, selected }) => (
                          <DropdownItem
                            $as={Link}
                            to={`/rounds?${toQueryString({
                              // Merge existing search params (so it doesn't reset sorting or the other selections)
                              ...filter,
                              [filterKey]: nextValue.join(","),
                            })}`}
                            active={active}
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
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </div>
                          </DropdownItem>
                        )}
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        );
      }}
    ></Dropdown>
  );
}
