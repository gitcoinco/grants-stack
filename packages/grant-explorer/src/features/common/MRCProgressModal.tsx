import { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface MRCProgressModalProps {
  isOpen: boolean;
  heading?: string;
  subheading?: string;
  body?: JSX.Element;
  redirectUrl?: string;
  children?: ReactNode;
}

export default function MRCProgressModal({
  isOpen,
  heading = "Processing...",
  subheading = "Please hold while we submit your donation.",
  children,
  ...props
}: MRCProgressModalProps) {
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
              <Dialog.Panel className="relative bg-white rounded-3xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-md sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 font-sans text-center sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium text-grey-500"
                    >
                      {heading}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-grey-400">{subheading}</p>
                    </div>
                    <div className="mt-2">{props.body}</div>
                  </div>
                </div>
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
