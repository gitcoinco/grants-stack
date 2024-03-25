import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { BaseModal } from "./BaseModal";
import { Status, Step } from "../../utils/steps";
import { RoundApplicationError } from "../../reducers/roundApplication";
import { NewGrantError } from "../../reducers/newGrant";

type StatusModalProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  currentStatus: Status;
  steps: Step[];
  error?: RoundApplicationError | NewGrantError;
  title: string;
};

type StepComponentProps = {
  ownStep: Step;
  currentStatus: Status;
  steps: Step[];
  error?: RoundApplicationError | NewGrantError;
};

const completedIcon = (
  <span className="step-icon step-icon-completed flex h-9 items-center">
    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600">
      <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
    </span>
  </span>
);

const currentIcon = (
  <span
    className="step-icon step-icon-current Status flex h-9 items-center"
    aria-hidden="true"
  >
    <span className="step-icon-outer relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
      <span className="step-icon-inner rounded-full bg-indigo-600" />
    </span>
  </span>
);

const waitingIcon = (
  <span
    className="step-icon step-icon-waiting flex h-9 items-center"
    aria-hidden="true"
  >
    <span
      // eslint-disable-next-line max-len
      className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
    </span>
  </span>
);

const errorIcon = (
  <span className="step-icon step-icon-error flex h-9 items-center">
    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
      <XMarkIcon className="w-5 h-5 text-white" aria-hidden="true" />
    </span>
  </span>
);

function StepComponent({
  ownStep,
  currentStatus,
  error,
  steps,
}: StepComponentProps) {
  let lastStepStatus = currentStatus;

  if (error !== undefined) {
    lastStepStatus = error.step;
  }

  const isLastStep = ownStep.status === steps[steps.length - 1].status;
  const isPreviousStep = ownStep.status < lastStepStatus;

  let icon = waitingIcon;

  if (isPreviousStep) {
    icon = completedIcon;
  } else if (ownStep.status === lastStepStatus) {
    icon = error === undefined ? currentIcon : errorIcon;
  }

  return (
    <li
      className={!isLastStep ? "pb-10 relative" : "relative"}
      data-testid={`step-${ownStep.name}`}
    >
      {!isLastStep ? (
        <div
          className={`absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 ${
            isPreviousStep ? "bg-indigo-600" : "bg-gray-200"
          }`}
          aria-hidden="true"
        />
      ) : null}
      <div className="group relative flex items-start">
        {icon}
        <span className="ml-4 flex min-w-0 flex-col">
          <span className="text-sm font-medium">{ownStep.name}</span>
          <span className="text-sm text-gray-500">{ownStep.description}</span>
        </span>
      </div>
    </li>
  );
}

export default function StatusModal({
  open,
  onClose,
  currentStatus,
  error,
  steps,
  title,
}: StatusModalProps) {
  return (
    <BaseModal
      isOpen={open}
      onClose={() => onClose(false)}
      hideCloseButton
      closeOnOverlayClick={false}
    >
      <>
        <div>
          <div>
            <h5 className="font-semibold mb-2">Processing...</h5>
            {error === undefined && <p className="mb-4">{title}</p>}
          </div>
        </div>
        <div>
          <nav aria-label="Progress">
            <ol className="overflow-hidden">
              {steps.map((step) => (
                <StepComponent
                  key={step.name}
                  error={error}
                  ownStep={step}
                  steps={steps}
                  currentStatus={currentStatus}
                />
              ))}
            </ol>
          </nav>
        </div>
      </>
    </BaseModal>
  );
}
