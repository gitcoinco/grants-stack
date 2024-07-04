import { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, XIcon } from "@heroicons/react/solid";
import { ProgressStatus } from "../api/types";

export type Step = {
  name: string;
  description: string;
  status: ProgressStatus;
};

interface ProgressModalProps {
  isOpen: boolean;
  steps: Step[];
  heading?: string;
  subheading?: string;
  redirectUrl?: string;
  children?: ReactNode;
}

export default function ProgressModal({
  isOpen,
  heading = "Processing...",
  subheading = "Please hold while your operation is in progress.",
  children,
  ...props
}: ProgressModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        data-testid="progress-modal"
        className="relative z-10"
        onClose={() => {
          /* Don't close the dialog when clicking the backdrop */
        }}
      >
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
                    <Dialog.Title
                      as="h3"
                      className="text-base leading-6 font-semibold text-grey-500"
                    >
                      {heading}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-grey-400">{subheading}</p>
                    </div>
                  </div>
                </div>
                <nav aria-label="Progress" className="ml-4 mt-11 mb-6">
                  <ol className="overflow-hidden">
                    {props.steps.map((step, stepIdx) => (
                      <li
                        key={stepIdx}
                        className={`relative ${
                          stepIdx !== props.steps.length - 1 && "pb-10"
                        }`}
                        data-testid={`${step.name}-${step.status}`}
                      >
                        {step.status === ProgressStatus.IS_SUCCESS ? (
                          <ModalStep
                            step={step}
                            icon={
                              <span
                                className="relative z-10 w-8 h-8 flex items-center justify-center bg-teal-500 rounded-full"
                                data-testid={`${step.name}-complete-icon`}
                              >
                                <CheckIcon
                                  className="w-5 h-5 text-white"
                                  aria-hidden="true"
                                />
                              </span>
                            }
                            line={
                              <div
                                className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-teal-500"
                                aria-hidden="true"
                              />
                            }
                            nameColor={"text-grey-500"}
                            descriptionColor={"text-grey-500"}
                            isLastStep={stepIdx === props.steps.length - 1}
                          />
                        ) : step.status === ProgressStatus.IN_PROGRESS ? (
                          <ModalStep
                            step={step}
                            icon={
                              <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-violet-500 rounded-full">
                                <span
                                  className="h-2.5 w-2.5 bg-violet-500 rounded-full animate-pulse-scale"
                                  data-testid={`${step.name}-current-icon`}
                                />
                              </span>
                            }
                            line={
                              <div
                                className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-grey-200"
                                aria-hidden="true"
                              />
                            }
                            nameColor="text-violet-500"
                            isLastStep={stepIdx === props.steps.length - 1}
                          />
                        ) : step.status === ProgressStatus.IS_ERROR ? (
                          <ModalStep
                            step={step}
                            icon={
                              <span className="relative z-10 w-8 h-8 flex items-center justify-center border-2 bg-white border-pink-500 rounded-full">
                                <XIcon
                                  className="w-5 h-5 text-pink-500"
                                  data-testid={`${step.name}-error-icon`}
                                />
                              </span>
                            }
                            line={
                              <div
                                className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-grey-300"
                                aria-hidden="true"
                              />
                            }
                            isLastStep={stepIdx === props.steps.length - 1}
                            nameColor="text-grey-500"
                          />
                        ) : step.status === ProgressStatus.NOT_STARTED ? (
                          <ModalStep
                            step={step}
                            icon={
                              <span
                                className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 rounded-full border-grey-400"
                                data-testid={`${step.name}-upcoming-icon`}
                              ></span>
                            }
                            line={
                              <div
                                className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-grey-300"
                                aria-hidden="true"
                              />
                            }
                            isLastStep={stepIdx === props.steps.length - 1}
                            nameColor="text-grey-400"
                          />
                        ) : (
                          <></>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        {/* Adding invisible button as modal needs to be displayed with a button */}
        <button className="h-0 w-0 overflow-hidden" />
        {children}
      </Dialog>
    </Transition.Root>
  );
}

function ModalStep(props: {
  step: Step;
  icon: JSX.Element;
  line: JSX.Element;
  nameColor: string;
  descriptionColor?: string;
  isAriaHidden?: boolean;
  isAriaCurrent?: boolean;
  isLastStep?: boolean;
}) {
  return (
    <>
      {!props.isLastStep ? props.line : null}
      <div
        className="relative flex items-start group"
        aria-current={!!props.isAriaCurrent}
      >
        <span
          className="h-9 flex items-center"
          aria-hidden={!!props.isAriaHidden}
        >
          {props.icon}
        </span>
        <span className="ml-4 min-w-0 flex flex-col">
          <span
            className={`text-xs font-semibold tracking-wide uppercase ${props.nameColor}`}
          >
            {props.step.name}
          </span>
          <span
            className={`text-sm ${props.descriptionColor ?? "text-grey-400"}`}
          >
            {props.step.description}
          </span>
        </span>
      </div>
    </>
  );
}
