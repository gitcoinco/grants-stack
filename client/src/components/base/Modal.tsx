// --- Chakra Elements
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Spinner,
} from "@chakra-ui/react";

export type VerifyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  verifyData?: JSX.Element;
  isLoading: boolean;
  title?: string;
  footer?: JSX.Element;
};

export function VerifyModal({
  isOpen,
  onClose,
  verifyData,
  isLoading,
  title,
  footer,
}: VerifyModalProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        {isLoading ? (
          <div className="p-20 text-center">
            <Spinner data-testid="loading-spinner" />
          </div>
        ) : (
          <>
            <ModalHeader px={8} pb={1} pt={6}>
              {title}
            </ModalHeader>
            <ModalCloseButton mr={2} />
            <ModalBody p={0}>
              <div className="px-8 pb-4 text-gray-500">
                {/* RSX Element passed in to show desired stamp output */}
                {verifyData}
              </div>
            </ModalBody>

            {footer && <div>footer</div>}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
