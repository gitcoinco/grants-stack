import { Dialog, Transition } from "@headlessui/react";
import { Button } from "common/src/styles";
import React, { Fragment, ReactNode, useRef } from "react";

interface ModalProps {
  title?: string;
  body?: JSX.Element;
  confirmButtonText?: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  confirmButtonAction: () => void;
  cancelButtonAction?: () => void;
  children?: ReactNode;
  modalStyle?: "wide" | "normal";
  disabled?: boolean;
}

export default function ConfirmationModal({
  title = "Please Confirm Decision",
  isOpen = false,
  setIsOpen = () => {
    /**/
  },
  confirmButtonText = "Confirm",
  cancelButtonAction = () => setIsOpen(false),
  children,
  modalStyle = "normal",
  ...props
}: ModalProps) {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setIsOpen}
        data-testid="confirm-modal"
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
              <Dialog.Panel className="relative bg-white rounded-3xl pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-md sm:w-full sm:p-6">
                <div className="sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className={`font-sans text-lg font-medium text-grey-500 ${
                        modalStyle === "wide" ? "text-center" : ""
                      }`}
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">{props.body}</div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Button
                    type="button"
                    $variant="outline"
                    className={`w-full inline-flex text-sm sm:ml-3 bg-blue-100 text-black font-mono px-8 focus:shadow-outline ${
                      modalStyle === "wide"
                        ? "sm_full justify-center"
                        : "sm:w-auto justify-center"
                    }`}
                    onClick={props.confirmButtonAction}
                    data-testid={"confirm-continue"}
                    disabled={props.disabled}
                  >
                    {confirmButtonText}
                  </Button>
                  <Button
                    type="button"
                    $variant="outline"
                    className={`w-full inline-flex text-sm sm:ml-3 font-mono px-8 ${
                      modalStyle === "wide"
                        ? "sm_full justify-center"
                        : "sm:w-auto justify-center"
                    }`}
                    onClick={cancelButtonAction}
                    ref={cancelButtonRef}
                    data-testid={"confirm-cancel"}
                  >
                    Cancel
                  </Button>
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
