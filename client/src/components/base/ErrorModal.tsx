import { BaseModal } from "./BaseModal";

export default function ErrorModal() {
  return (
    <BaseModal isOpen hideCloseButton title="Error" onClose={() => {}}>
      <div>Error Modal</div>
    </BaseModal>
  );
}
