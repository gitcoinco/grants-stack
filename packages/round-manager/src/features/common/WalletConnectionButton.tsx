import { Fragment, useState } from "react"
import { useConnect } from "wagmi"
import { Dialog, Transition } from "@headlessui/react"
import { XIcon } from "@heroicons/react/solid"
import { Button } from "./styles"


interface ButtonProps {
  text?: string;
  className?: string;
}

export default function WalletConnectionButton({
  text = "Connect Wallet",
  className = "bg-violet-400 mt-8 py-4 px-8 rounded text-white"
}: ButtonProps) {

  const [open, setOpen] = useState(false)

  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        {text}
      </button>
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
                    {connectors.map((connector: any) => (
                      <Button
                        type="button"
                        className="inline-flex justify-center w-full sm:text-sm mt-4"
                        disabled={!connector.ready}
                        key={connector.id}
                        onClick={() => connect({ connector })}
                      >
                        {connector.name}
                        {!connector.ready && " (unsupported)"}
                        {isLoading &&
                          connector.id === pendingConnector?.id &&
                          " (connecting)"}
                      </Button>
                    ))}

                    {error && <div className="text-sm text-red-600 my-4">{error.message}</div>}

                    <div className="py-4">
                      <p className="text-sm">
                        <span>Don't have a wallet?</span>
                        <a
                          href="https://ethereum.org/en/wallets"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-grey-500 font-bold ml-2"
                        >Learn more</a>
                      </p>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}