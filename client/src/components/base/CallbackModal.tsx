import { BaseModal } from "./BaseModal";
import Button, { ButtonVariants } from "./Button";

interface CallbackModalProps {
  modalOpen: boolean;
  toggleModal: (status: boolean) => void;
  title?: string;
  cancelText?: string;
  confirmText?: string;
  confirmHandler: () => void;
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
}: CallbackModalProps) {
  return (
    <BaseModal
      isOpen={modalOpen}
      onClose={() => toggleModal(false)}
      title={title}
    >
      <>
        <div className="flex">
          <div className="mt-4">
            {headerImageUri && <img src={headerImageUri} alt="header" />}
            <h5 className="font-semibold mb-2">{title}</h5>
            {children}
          </div>
        </div>
        <div className="flex justify-center">
          {cancelText && (
            <Button
              variant={ButtonVariants.outline}
              onClick={() => toggleModal(false)}
            >
              {cancelText}
            </Button>
          )}
          <Button
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
