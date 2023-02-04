import React, { Fragment, ReactNode, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "common/src/styles";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface InfoModalProps {
  title?: string;
  body?: JSX.Element;
  isOpen: boolean;
  continueButtonText?: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  continueButtonAction: () => void;
  cancelButtonAction?: () => void;
  children?: ReactNode;
}

export default function InfoModal({
  title = "Information Title",
  isOpen = false,
  setIsOpen = () => {
    /**/
  },
  continueButtonAction = () => {
    /**/
  },
  continueButtonText = "Continue",
  cancelButtonAction = () => setIsOpen(false),
  children,
  ...props
}: InfoModalProps) {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setIsOpen}
        data-testid="info-modal"
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
                <div className="sm:flex sm:items-start flex-col">
                  <div className="flex flex-row justify-between">
                    <div className="w-10 h-10 flex items-center justify-center bg-violet-100 rounded-full">
                      <ExclamationCircleIcon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base leading-6 font-semibold text-grey-500"
                        data-testid="Info-heading"
                      >
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">{props.body}</div>
                    </div>
                  </div>
                  <div className="self-end mt-8">
                    <Button
                      type="button"
                      $variant="outline"
                      className="w-full inline-flex text-sm sm:ml-3 sm:w-auto"
                      onClick={cancelButtonAction}
                      ref={cancelButtonRef}
                      data-testid={"info-cancel"}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="w-full inline-flex text-sm sm:ml-3 sm:w-auto"
                      onClick={continueButtonAction}
                      data-testid="info-continue"
                    >
                      {continueButtonText}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        {children}
      </Dialog>
    </Transition.Root>
  );
}
