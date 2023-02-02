import { Button } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
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
    <div className="relative bg-gitcoin-violet-100 p-3 rounded-md flex flex-1 justify-between items-center">
      <div className="flex flex-1 justify-start items-center">
        <div className="text-gitcoin-violet-500 fill-current w-6 mx-4">
          <InformationCircleIcon />
        </div>
        <p className="font-medium m-0 p-0 text-primary-text text-sm">
          Apply to {round.programName} {round.roundMetadata.name} and get your
          project funded!
        </p>
      </div>
      <Button
        className="font-medium bg-gitcoin-violet-400"
        colorScheme="purple"
        onClick={confirmHandler}
      >
        Apply
      </Button>
    </div>
  );
}
