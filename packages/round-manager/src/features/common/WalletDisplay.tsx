import { Fragment, useState } from "react"
import { useDisconnect, useSwitchNetwork } from "wagmi"
import { Dialog, Menu, Transition } from "@headlessui/react"
import { ChevronDownIcon, XIcon } from "@heroicons/react/solid"

import { Button } from "./styles"
import { useWallet } from "./Auth"

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function WalletDisplay() {
  const [open, setOpen] = useState(false)

  const { address, chain } = useWallet()

  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const { disconnect } = useDisconnect()

  return (
    <div className="relative z-0 inline-flex shadow-sm rounded-md">
      <Button
        type="button"
        $variant="outline"
        className="relative inline-flex items-center px-4 py-0 rounded-l-md text-sm w-[150px] bg-grey-500 text-white"
      >
        <span className="truncate">{address}</span>
      </Button>
      <Menu as="div" className="-ml-px relative block">
        <Menu.Button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-grey-100 text-sm text-white focus:z-10">
          <span className="sr-only">Open options</span>
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 mt-2 -mr-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item key="Switch Network">
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm w-full text-left"
                    )}
                    onClick={() => setOpen(true)}
                  >
                    Switch Network
                  </button>
                )}
              </Menu.Item>
              <Menu.Item key="Disconnect">
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm w-full text-left"
                    )}
                    onClick={() => disconnect()}
                  >
                    Disconnect
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
                  <div className="hidden sm:block absolute top-0 right-0 py-4 pr-4">
                    <button
                      type="button"
                      className="text-grey-300 hover:text-grey-400 absolute top-0 right-0 py-4 pr-4"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-4">
                    {chains.map((x) => (
                      <Button
                        type="button"
                        className="inline-flex justify-center w-full sm:text-sm mt-4"
                        disabled={!switchNetwork || x.id === chain.id}
                        key={x.id}
                        onClick={() => switchNetwork?.(x.id)}
                      >
                        {x.name}
                        {isLoading && pendingChainId === x.id && " (switching)"}
                      </Button>
                    ))}
                    {error && <div className="text-sm text-red-600 my-4">{error.message}</div>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
