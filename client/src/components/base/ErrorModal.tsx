import { BaseModal } from "./BaseModal";

type ErrorModalProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  title?: string;
  message?: string;
};

export default function ErrorModal({
  open,
  onClose,
  title,
  message,
}: ErrorModalProps): JSX.Element {
  return (
    <BaseModal
      isOpen={open}
      hideCloseButton={false}
      title={title}
      onClose={() => onClose(false)}
    >
      <div>
        <p>{title}</p>
        <p>{message}</p>
      </div>
    </BaseModal>
  );
}
