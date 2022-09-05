import { Button } from "@chakra-ui/react";

interface RoundApplyAlertProps {
  show: boolean;
  confirmHandler: () => void;
}

export default function RoundApplyAlert({
  show,
  confirmHandler,
}: RoundApplyAlertProps) {
  return (
    <div
      className="relative h-14 bg-purple-200 p-2 rounded"
      style={{ display: show ? "block" : "none" }}
    >
      <p className="p-2 font-bold">
        Apply to Optimism Grant Round and get your project funded!
      </p>
      <Button
        className="absolute inset-y-0 right-10 m-2"
        colorScheme="purple"
        onClick={confirmHandler}
      >
        Apply to Round
      </Button>
    </div>
  );
}
