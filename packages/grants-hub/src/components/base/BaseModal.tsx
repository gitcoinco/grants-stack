// --- Chakra Elements
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";

export type ToggleModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type BaseModalProps = ToggleModalProps & {
  children?: JSX.Element;
  title?: string;
  size?: string;
  footer?: JSX.Element;
  closeOnOverlayClick?: boolean;
  hideCloseButton?: boolean;
};

export function BaseModal({
  isOpen,
  onClose,
  children,
  size,
  title,
  footer,
  closeOnOverlayClick,
  hideCloseButton,
}: BaseModalProps): JSX.Element {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={closeOnOverlayClick ?? true}
      size={size || "xl"}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <>
          {title && (
            <ModalHeader px={8} pb={1} pt={6}>
              {title}
            </ModalHeader>
          )}
          {(hideCloseButton === undefined || hideCloseButton === false) && (
            <ModalCloseButton mr={2} />
          )}
          <ModalBody p={0}>
            <div className="p-6">
              {/* RSX Element passed in to show desired stamp output */}
              {children}
            </div>
          </ModalBody>

          {footer && <div>{footer}</div>}
        </>
      </ModalContent>
    </Modal>
  );
}
