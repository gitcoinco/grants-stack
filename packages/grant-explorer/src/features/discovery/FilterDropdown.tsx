import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import isEqual from "lodash-es/isEqual";

import { Dropdown, DropdownItem } from "../common/Dropdown";

export type FilterDropdownOption<T> = {
  label: string;
  children: { label: string; value: T }[];
  allowMultiple: boolean;
};

type FilterDropdownProps<T> = {
  options: FilterDropdownOption<T>[];
  onChange: (selected: T[]) => void;
  selected: T[];
};

export function FilterDropdown<T>(props: FilterDropdownProps<T>): JSX.Element {
  const options = props.options.flatMap((option) => {
    return option.children;
  });

  const selected = options.filter((option) =>
    props.selected.some((selected) => isEqual(selected, option.value))
  );

  const selectedLabels = selected.map((option) => option.label);
  const selectedValues = selected.map((option) => option.value);

  let selectedLabel = "All";

  if (selectedLabels.length === 1) {
    selectedLabel = selectedLabels[0];
  } else if (selectedLabels.length > 1) {
    selectedLabel = "Multiple";
  }

  return (
    <Dropdown
      label={selectedLabel}
      options={props.options}
      keepOpen
      headerElement={(close) => (
        <button
          className="relative w-[340px] py-2 pl-2 pr-10 text-left hover:bg-grey-100"
          onClick={() => {
            props.onChange([]);
            close();
          }}
        >
          All
        </button>
      )}
      renderItem={(item) => {
        const anyChildrenSelected = item.children.some((child) =>
          props.selected.some((value) => isEqual(value, child.value))
        );

        return (
          <Disclosure defaultOpen={anyChildrenSelected}>
            <div className="relative mt-1">
              <Disclosure.Button className="relative w-full py-2 pl-2 pr-10 text-left hover:bg-grey-100">
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
              </Disclosure.Button>
              <Disclosure.Panel className="mt-1 w-full overflow-auto p-2">
                {item.children.map((child, j) => {
                  const isSelected = props.selected.some((value) =>
                    isEqual(value, child.value)
                  );

                  const onTrigger = () => {
                    let newSelected: T[] = [...selectedValues];

                    // clear sibling options if allowMultiple is false
                    if (item.allowMultiple === false) {
                      newSelected = newSelected.filter(
                        (option) =>
                          !item.children.some((child) =>
                            isEqual(child.value, option)
                          )
                      );
                    }

                    if (!isSelected) {
                      newSelected.push(child.value);
                    } else {
                      newSelected = newSelected.filter((option) => {
                        return !isEqual(option, child.value);
                      });
                    }

                    props.onChange(newSelected);
                  };

                  // HeadlessUI binds onclick so clicking the label doesn't work to trigger the checkbox
                  return (
                    <DropdownItem
                      key={j}
                      $as="label"
                      onClick={(e) => {
                        e.preventDefault();
                        onTrigger();
                      }}
                      className={`block truncate ${
                        isSelected ? "font-medium" : "font-normal"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={isSelected}
                        onChange={() => {
                          // do nothing
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrigger();
                        }}
                      />
                      {child.label}
                    </DropdownItem>
                  );
                })}
              </Disclosure.Panel>
            </div>
          </Disclosure>
        );
      }}
    ></Dropdown>
  );
}
