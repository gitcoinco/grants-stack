import { Menu, Transition } from "@headlessui/react";
import { Fragment, PropsWithChildren, ReactElement } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import tw from "tailwind-styled-components";

type DropdownProps<T> = PropsWithChildren<{
  label?: string;
  options: T[];
  keepOpen?: boolean;
  renderItem: (p: { active: boolean; close: () => void } & T) => ReactElement;
  headerElement?: (close: () => void) => ReactElement;
}>;

export function Dropdown<T>({
  label,
  options,
  keepOpen,
  renderItem,
  headerElement,
}: DropdownProps<T>) {
  return (
    <Menu as="div" className="md:relative inline-block text-left z-20">
      {({ close }) => (
        <>
          <div>
            <Menu.Button className="inline-flex gap-2 items-center">
              <span className="text-white py-2">{label}</span>
              <ChevronDownIcon
                className="h-5 w-5 text-black"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute  max-h-[400px] overflow-y-auto w-full md:w-auto p-2 right-0 mt-2 origin-top-right rounded-2xl bg-white shadow-lg"
              static
            >
              {headerElement?.(close)}
              {options.map((option, i) => (
                <Menu.Item
                  key={i}
                  as="div"
                  onClick={(e) => keepOpen && e.preventDefault()}
                >
                  {({ active }) => renderItem({ active, close, ...option })}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}

export const DropdownItem = tw("div")<{ active?: boolean }>`
group
flex
w-full
items-center
rounded-md
px-2
py-3
text-sm
whitespace-nowrap
underline-offset-4
cursor-pointer
hover:bg-grey-100
${(props) => (props.active ? "bg-grey-100" : "")}
`;
