import {
  Alert as ChakraAlert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  useDisclosure,
} from "@chakra-ui/react";

export enum AlertStatus {
  success = "success",
  info = "info",
  warning = "warning",
  error = "error",
  loading = "loading",
}

interface AlertProps {
  status: AlertStatus;
  title: React.ReactNode | string;
  body: React.ReactNode | string;
  variant?: string;
  alignItems?: string;
  justifyContent?: string;
  height?: string;
}

function Alert({
  status,
  title,
  body,
  variant,
  alignItems,
  justifyContent,
  height,
}: AlertProps) {
  const { isOpen: isVisible, onClose } = useDisclosure({ defaultIsOpen: true });

  return isVisible ? (
    <ChakraAlert
      className="mb-2 bg-gitcoin-teal-100 rounded-lg"
      status={status}
      variant={variant}
      alignItems={alignItems}
      justifyContent={justifyContent}
      height={height}
    >
      <AlertIcon />
      <Box>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{body}</AlertDescription>
      </Box>
      <CloseButton
        alignSelf="inherit"
        position="relative"
        right={-5}
        top={-10}
        onClick={onClose}
      />
    </ChakraAlert>
  ) : null;
}

export default Alert;
