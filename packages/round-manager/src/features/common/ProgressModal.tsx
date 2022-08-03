import { Fragment, useEffect, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { CheckIcon } from "@heroicons/react/solid"


interface ProgressModalProps {
  show: boolean;
  steps: Array<{
    name: string;
    description: string;
    status: "complete" | "current" | "upcoming"
  }>;
  heading?: string;
  subheading?: string;
  redirectUrl?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function ProgressModal(
  {
    heading = "Processing...",
    subheading = "Please hold while your operation is in progress.",
    redirectUrl = "",
    ...props
  }: ProgressModalProps
) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(props.show)
  }, [props.show])

  return (
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
          <div className="fixed inset-0 bg-grey-400 bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="relative bg-white px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-base leading-6 font-semibold text-grey-500">
                      {heading}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-grey-400">
                        {subheading}
                      </p>
                    </div>
                  </div>
                </div>
                <nav aria-label="Progress" className="ml-4 mt-11 mb-6">
                  <ol className="overflow-hidden">
                    {props.steps.map((step, stepIdx) => (
                      <li key={step.name} className={classNames(stepIdx !== props.steps.length - 1 ? 'pb-10' : '', 'relative')}>
                        {step.status === 'complete' ? (
                          <>
                            {stepIdx !== props.steps.length - 1 ? (
                              <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-teal-500" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start group">
                              <span className="h-9 flex items-center">
                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-teal-500 rounded-full">
                                  <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                                </span>
                              </span>
                              <span className="ml-4 min-w-0 flex flex-col">
                                <span className="text-xs font-semibold tracking-wide uppercase">{step.name}</span>
                                <span className="text-sm text-grey-400">{step.description}</span>
                              </span>
                            </div>
                          </>
                        ) : step.status === 'current' ? (
                          <>
                            {stepIdx !== props.steps.length - 1 ? (
                              <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start group" aria-current="step">
                              <span className="h-9 flex items-center" aria-hidden="true">
                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-violet-500 rounded-full">
                                  <span className="h-2.5 w-2.5 bg-violet-500 rounded-full" />
                                </span>
                              </span>
                              <span className="ml-4 min-w-0 flex flex-col">
                                <span className="text-xs font-semibold tracking-wide uppercase text-violet-500">{step.name}</span>
                                <span className="text-sm text-grey-400">{step.description}</span>
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            {stepIdx !== props.steps.length - 1 ? (
                              <div className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start group">
                              <span className="h-9 flex items-center" aria-hidden="true">
                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full group-hover:border-gray-400">
                                  <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300" />
                                </span>
                              </span>
                              <span className="ml-4 min-w-0 flex flex-col">
                                <span className="text-xs font-semibold tracking-wide uppercase text-grey-400">{step.name}</span>
                                <span className="text-sm text-grey-400">{step.description}</span>
                              </span>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}