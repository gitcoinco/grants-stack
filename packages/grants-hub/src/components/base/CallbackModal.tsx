import classNames from "classnames";
import { BaseModal } from "./BaseModal";
import Button, { ButtonVariants } from "./Button";

interface CallbackModalProps {
  modalOpen: boolean;
  toggleModal: (status: boolean) => void;
  title?: string;
  cancelText?: string;
  confirmText?: string;
  confirmHandler: () => void;
  hideCloseButton?: boolean;
  children?: JSX.Element;
  headerImageUri?: string;
}

export default function CallbackModal({
  modalOpen,
  toggleModal,
  confirmHandler,
  cancelText,
  confirmText,
  title,
  children,
  headerImageUri,
  hideCloseButton = false,
}: CallbackModalProps) {
  const handleModalClose = () => {
    toggleModal(false);
  };

  return (
    <BaseModal
      isOpen={modalOpen}
      onClose={handleModalClose}
      title={title}
      hideCloseButton={hideCloseButton}
    >
      <>
        <div className="flex">
          <div className="text-center">
            {headerImageUri && <img src={headerImageUri} alt="header" />}
            <h5 className="font-semibold mb-2">{title}</h5>
            {children}
          </div>
        </div>
        <div
          className={classNames("w-full justify-center text-center", {
            "grid grid-cols-2": cancelText,
          })}
        >
          {cancelText && (
            <Button
              styles={["p-3", "justify-center"]}
              variant={ButtonVariants.outline}
              onClick={handleModalClose}
            >
              {cancelText}
            </Button>
          )}
          <Button
            styles={["p-3", "justify-center"]}
            onClick={() => confirmHandler()}
            variant={ButtonVariants.primary}
          >
            {confirmText}
          </Button>
        </div>
      </>
    </BaseModal>
  );
}
