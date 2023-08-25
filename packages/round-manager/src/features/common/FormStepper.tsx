import { Button } from "common/src/styles";

export interface FormStepperProps {
  currentStep: number;
  stepsCount: number;
  disableNext?: boolean;
  prev: () => void;
}

export function FormStepper({
  disableNext = false,
  ...props
}: FormStepperProps) {
  return (
    <div className="flex justify-end space-x-4">
      {props.currentStep > 1 && (
        <Button
          className="px-3.5 py-2 shadow-sm text-sm"
          type="button"
          $variant="outline"
          onClick={props.prev}
        >
          Previous
        </Button>
      )}

      <Button
        className="px-3.5 py-2 shadow-sm text-sm"
        type="submit"
        $variant="solid"
        disabled={disableNext}
      >
        {props.currentStep === props.stepsCount ? "Launch" : "Next"}
      </Button>
    </div>
  );
}
