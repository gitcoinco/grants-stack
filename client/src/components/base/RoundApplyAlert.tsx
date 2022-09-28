import { Button } from "@chakra-ui/react";
import { Round } from "../../types";

interface RoundApplyAlertProps {
  show: boolean;
  confirmHandler: () => void;
  round?: Round;
}

export default function RoundApplyAlert({
  show,
  confirmHandler,
  round,
}: RoundApplyAlertProps) {
  if (!show || !round) {
    return null;
  }

  return (
    <div className="relative h-14 bg-purple-200 p-2 rounded">
      <p className="p-2 font-bold">
        Apply to {round.programName} {round.roundMetadata.name} and get your
        project funded!
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
