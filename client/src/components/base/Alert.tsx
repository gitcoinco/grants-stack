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
  title: string;
  body: any;
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
      className="mb-2 rounded-lg"
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
