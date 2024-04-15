import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { CHAINS } from "../api/utils";
import { ChainId } from "common";
import { Link } from "react-router-dom";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export type ExploreRoundsDropdownProps = {
  chainId: number;
  name: string;
  link: string;
};

export default function ExploreRoundsDropdown(props: {
  rounds?: ExploreRoundsDropdownProps[];
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
            {props.rounds ? (
              props.rounds?.map((round: ExploreRoundsDropdownProps) => {
                return (
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={classNames(
                          active
                            ? "flex flex-row justify-end text-gray-800 px-4 py-2 text-sm text-right hover:bg-gray-100"
                            : "flex flex-row justify-end text-gray-800 px-4 py-2 text-sm text-right"
                        )}
                      >
                        <img
                          src={CHAINS[round.chainId as ChainId]?.logo}
                          alt={"Chain"}
                          className="rounded-full w-6 h-6 mr-2"
                        />
                        <Link to={round.link}>
                          <span className="font-sans text-right">
                            {round.name}
                          </span>
                        </Link>
                      </div>
                    )}
                  </Menu.Item>
                );
              })
            ) : (
              <Menu.Item disabled>
                <div className="flex flex-row justify-end text-gray-800 px-4 py-2 text-sm cursor-not-allowed">
                  <span className="text-right">No rounds available</span>
                </div>
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
