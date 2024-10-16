import { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg";

interface MintAttestationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  heading?: string;
  subheading?: string;
  body?: JSX.Element;
  redirectUrl?: string;
  children?: ReactNode;
}

export default function MintAttestationProgressModal({
  isOpen,
  onClose,
  heading = "Processing...",
  subheading = "Please hold while we submit your donation.",
  children,
  ...props
}: MintAttestationProgressModalProps) {
  const onAction =
    heading !== "Mint your impact!" && heading !== "Your donation impact";

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        data-testid="progress-modal"
        className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClose={onClose}
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

        <div
          className={`flex items-center ${onAction ? "text-left" : "text-center"} justify-center min-h-screen p-4`}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel
              className="relative bg-white rounded-3xl px-6 pt-5 pb-4 shadow-xl transform transition-all sm:max-w-md max-w-lg min-w-[375px]  max-h-[90vh] overflow-x-auto overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <Dialog.Title
                className={`${onAction ? "text-lg" : "text-3xl"} font-modern-era-bold text-grey-500`}
              >
                {heading}
              </Dialog.Title>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="text-grey-400 hover:text-grey-500"
                  onClick={() => {
                    if (props.redirectUrl) {
                      window.location.href = props.redirectUrl;
                    }
                    onClose();
                  }}
                >
                  <CloseIcon className="size-4 absolute top-4 right-4" />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm font-mona text-grey-400">{subheading}</p>
              </div>
              <div className="mt-4">{props.body}</div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
        {/* Adding invisible button as modal needs to be displayed with a button */}
        <button className="h-0 w-0 overflow-hidden" />
        {children}
      </Dialog>
    </Transition.Root>
  );
}
