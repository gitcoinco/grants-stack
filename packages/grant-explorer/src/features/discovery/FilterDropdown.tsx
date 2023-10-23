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
import { toURL } from "./RoundsFilter";

type Option = {
  label: string;
  value: string;
  children: Option[];
};
const filterOptions = [
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
        value: "MERKLE",
      },
      {
        label: "Direct grants",
        value: "DIRECT",
      },
    ],
  },
  {
    label: "Status",
    value: "status",
    children: [
      {
        label: "Active",
        value: "",
      },
      {
        label: "Taking applications",
        value: "apply",
      },
      {
        label: "Finished",
        value: "finished",
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
] as Option[];

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
function getLabel(filter: FilterProps) {
  return (
    // Convert { key: val } to [[key, val]] and remove empty values
    Object.entries(filter)
      .filter(([, val]) => Boolean(val))
      .reduce(
        (acc, [key, val], _, arr) => {
          // More than 1 filter is selected
          if (arr.length > 1) return { label: "Multiple" } as Option;

          // Find the selected option
          const selected =
            filterOptions
              .find((opt) => opt.value === key)
              ?.children.find((c) => c.value === val) || acc;

          return selected;
        },
        filterOptions[0] // Initialize with label: All
      )
  );
}
export function FilterDropdown({ status, type, network }: FilterProps) {
  // Get existing search params
  const params = Object.fromEntries(useSearchParams()[0]);

  const selected = getLabel({ status, type, network });
  return (
    <Dropdown label={selected?.label}>
      {filterOptions.map((item) => (
        <>
          {!item.children.length ? (
            <DropdownItem $as={Link} to={`/rounds`}>
              {item.label}
            </DropdownItem>
          ) : (
            <Listbox value={selected} onChange={console.log}>
              <div className="relative mt-1">
                <Listbox.Button className="relative w-[340px] py-2 pl-3 pr-10 text-left hover:bg-grey-100">
                  {({ open }) => {
                    const Icon = open ? ChevronUpIcon : ChevronDownIcon;
                    return (
                      <>
                        <span className="block truncate">{item.label}</span>
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
                    {item.children.map((child, j) => {
                      const checked = Boolean(
                        item.value &&
                          child.value === { status, type, network }[item.value]
                      );

                      return (
                        <Listbox.Option key={j} value={child}>
                          {({ active, selected }) => (
                            <DropdownItem
                              $as={Link}
                              to={`/rounds?${toURL({
                                ...params,
                                [item.value]: child.value,
                              })}`}
                              active={active}
                            >
                              <div className="flex gap-2">
                                <input type="checkbox" checked={checked} />
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
          )}
        </>
      ))}
    </Dropdown>
  );
}
