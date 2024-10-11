import { ReactNode } from "react";
import { Dialog } from "@headlessui/react";
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  children?: ReactNode;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
  ...props
}: ModalProps) {
  return (
    <Dialog
      as="div"
      open={isOpen}
      data-testid="modal-dialog"
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto m-10"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onClose={onClose}
    >
      <Dialog.Panel
        className="relative bg-white rounded-3xl p-10 text-left shadow-xl transform transition-all  overflow-x-auto overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {showCloseButton && (
          <button
            type="button"
            className="absolute z-20 top-6 right-6 text-grey-400 hover:text-grey-500"
            onClick={() => {
              if (props.redirectUrl) {
                window.location.href = props.redirectUrl;
              }
              onClose();
            }}
          >
            <CloseIcon className="size-5" />
          </button>
        )}
        {children}
      </Dialog.Panel>
    </Dialog>
  );
}
