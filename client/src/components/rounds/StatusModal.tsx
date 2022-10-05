import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { BaseModal } from "../base/BaseModal";
import { Status, RoundApplicationError } from "../../reducers/roundApplication";

type StatusModalProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  currentStatus: Status;
  error?: RoundApplicationError;
};

type Step = {
  name: string;
  description: string;
  status: Status;
};

export const steps: Step[] = [
  {
    name: "Gathering Data",
    description: "Preparing your application.",
    status: Status.BuildingApplication,
  },
  {
    name: "Signing",
    description: "Signing the application metadata with your wallet.",
    status: Status.SigningApplication,
  },
  {
    name: "Storing",
    description: "The metadatais being saved in a safe place.",
    status: Status.UploadingMetadata,
  },
  {
    name: "Applying",
    description: "Sending your application.",
    status: Status.SendingTx,
  },
  {
    name: "Redirecting",
    description: "Just another moment while we finish things up.",
    status: Status.Sent,
  },
];

type StepComponentProps = {
  ownStep: Step;
  currentStatus: Status;
  error?: RoundApplicationError;
};

const completedIcon = (
  <span className="step-icon step-icon-completed flex h-9 items-center">
    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 group-hover:bg-teal-800">
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
      className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
    </span>
  </span>
);

const errorIcon = (
  <span className="step-icon step-icon-error flex h-9 items-center">
    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 group-hover:bg-red-800">
      <XMarkIcon className="w-5 h-5 text-white" aria-hidden="true" />
    </span>
  </span>
);

function StepComponent({ ownStep, currentStatus, error }: StepComponentProps) {
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
}: StatusModalProps) {
  const working = error === undefined && currentStatus !== Status.Sent;
  const onCloseCallback = working ? () => {} : () => onClose(false);

  return (
    <BaseModal
      isOpen={open}
      hideCloseButton={working}
      onClose={onCloseCallback}
    >
      <>
        <div>
          <div>
            <h5 className="font-semibold mb-2">Processing...</h5>
            {error === undefined && (
              <p className="mb-4">
                Please hold while we submit your grant round application.
              </p>
            )}

            {error !== undefined && (
              <p className="mb-4 bg-red-600 text-white py-2 px-2 rounded-md">
                There has been a systems error while applyting to this round.
                Please close this modal and try again.
              </p>
            )}
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
