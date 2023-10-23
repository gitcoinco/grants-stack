import { Menu, Transition } from "@headlessui/react";
import {
  Children,
  cloneElement,
  Fragment,
  PropsWithChildren,
  ReactElement,
} from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import tw from "tailwind-styled-components";

export function Dropdown({
  label,
  children,
}: { label?: string } & PropsWithChildren) {
  return (
    <Menu as="div" className="relative inline-block text-left z-20">
      <div>
        <Menu.Button className="inline-flex gap-2">
          <span className="text-white">{label}</span>
          <ChevronDownIcon className="h-5 w-5 text-black" aria-hidden="true" />
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
        <Menu.Items className="absolute p-2  right-0 mt-2 origin-top-right rounded-2xl bg-white shadow-lg">
          {Children.map(children, (child, i) => (
            <Menu.Item key={i} as="div">
              {({ active }) => cloneElement(child as ReactElement, { active })}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
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
${(props) => (props.active ? "bg-grey-100" : "")}
`;
