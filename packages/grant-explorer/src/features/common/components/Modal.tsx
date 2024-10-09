import { ReactNode } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  heading?: string;
  subheading?: string;
  body?: JSX.Element;
  redirectUrl?: string;
  children?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  heading,
  subheading,
  body,
  children,
  ...props
}: ModalProps) {
  return (
    <Dialog
      as="div"
      open={isOpen}
      data-testid="modal-dialog"
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onClose={onClose}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel
          className="relative bg-white rounded-3xl px-6 pt-5 pb-4 text-left shadow-xl transform transition-all sm:max-w-md w-full max-h-[90vh] overflow-x-auto overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div
            className={`flex ${
              heading ? "justify-between" : "justify-end"
            } items-center`}
          >
            {heading && (
              <Dialog.Title className="text-lg font-modern-era-bold text-grey-500">
                {heading}
              </Dialog.Title>
            )}
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
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {subheading && (
            <div className="mt-2">
              <p className="text-sm font-mona text-grey-400">{subheading}</p>
            </div>
          )}
          {body && <div className="mt-4">{body}</div>}
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
