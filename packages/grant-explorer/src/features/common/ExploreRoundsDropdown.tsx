import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { RoundGetRound } from "data-layer";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

export default function ExploreRoundsDropdown(props: {
  rounds?: RoundGetRound[];
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-transparent px-3 py-2 text-mono text-sm font-semibold text-gray-900">
          Explore rounds
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-800"
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
        <Menu.Items className="absolute cursor-pointer right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                // todo: list the rounds and style
                <div className="text-gray-800 block px-4 py-2 text-sm hover:bg-gray-100">
                  Round 1
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
