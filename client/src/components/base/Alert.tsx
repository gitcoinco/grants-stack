import {
  Alert as ChakraAlert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  useDisclosure
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
  variant?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  textAlign?: string;
  height?: string;
}

function Alert({
  status,
  variant,
  flexDirection,
  alignItems,
  justifyContent,
  textAlign,
  height,
}: AlertProps) {
  const {
    isOpen: isVisible,
    onClose,
    onOpen,
  } = useDisclosure({ defaultIsOpen: true })

  return isVisible ? (
    <ChakraAlert className="mb-2 rounded-lg" status={status}>
      <AlertIcon />
      <Box>
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Your application has been received. We will review your application and respond within the next 48 hours.
        </AlertDescription>
      </Box>
      <CloseButton
        alignSelf="flex-end"
        position="relative"
        right={-1}
        top={-1}
        onClick={onClose}
      />
    </ChakraAlert>
  ) : null;
}

export default Alert;
