import React, { useMemo } from "react";
import { ChainId } from "common";
import { CHAINS } from "../../api/utils";
import { ProgressStatus } from "../../api/types";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCheckoutStore } from "../../../checkoutStore";
import { Button } from "common/src/styles";

export type Step = {
  name: string;
  description: string;
  status: ProgressStatus;
};

type MRCProgressModalBodyProps = {
  chainIdsBeingCheckedOut: number[];
  tryAgainFn: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function MRCProgressModalBody({
  tryAgainFn,
  setIsOpen,
}: MRCProgressModalBodyProps) {
  const checkoutStore = useCheckoutStore();
  const chainIdsBeingCheckedOut = checkoutStore.chainsToCheckout;
  const chainId = (checkoutStore.currentChainBeingCheckedOut ??
    chainIdsBeingCheckedOut[0]) as ChainId;

  const { voteStatus, permitStatus, chainSwitchStatus } = useCheckoutStore();

  const progressSteps = useMemo(() => {
    const stepsWithChainSwitch = [
      {
        name: "Switch Network",
        description: `Switch network to ${CHAINS[chainId].name}`,
        status: chainSwitchStatus[chainId],
      },
      {
        name: "Permit",
        description: "Approve checkout contract",
        status:
          chainSwitchStatus[chainId] !== ProgressStatus.IS_SUCCESS
            ? ProgressStatus.NOT_STARTED
            : permitStatus[chainId],
      },
      {
        name: "Submit",
        description: "Finalize your contribution",
        status:
          permitStatus[chainId] !== ProgressStatus.IS_SUCCESS
            ? ProgressStatus.NOT_STARTED
            : voteStatus[chainId],
      },
    ];
    const stepsWithoutChainSwitch = [
      {
        name: "Permit",
        description: "Permit checkout contract",
        status: permitStatus[chainId],
      },
      {
        name: "Submit",
        description: "Finalize your contribution",
        status: voteStatus[chainId],
      },
    ];
    return chainSwitchStatus[chainId] !== ProgressStatus.NOT_STARTED
      ? stepsWithChainSwitch
      : stepsWithoutChainSwitch;
  }, [chainId, chainSwitchStatus, permitStatus, voteStatus]);

  return (
    <div className="sm:w-fit md:w-[400px]">
      {chainIdsBeingCheckedOut.length > 1 && (
        <div className="flex py-2 justify-between">
          {chainIdsBeingCheckedOut.map((chainId, idx) => {
            const notStarted =
              chainSwitchStatus[chainId] === ProgressStatus.NOT_STARTED &&
              voteStatus[chainId] === ProgressStatus.NOT_STARTED &&
              permitStatus[chainId] === ProgressStatus.NOT_STARTED;
            const inProgress =
              chainSwitchStatus[chainId] === ProgressStatus.IN_PROGRESS ||
              voteStatus[chainId] === ProgressStatus.IN_PROGRESS ||
              permitStatus[chainId] === ProgressStatus.IN_PROGRESS ||
              chainSwitchStatus[chainId] === ProgressStatus.IS_ERROR ||
              voteStatus[chainId] === ProgressStatus.IS_ERROR ||
              permitStatus[chainId] === ProgressStatus.IS_ERROR;
            const isSuccess =
              checkoutStore.voteStatus[chainId] === ProgressStatus.IS_SUCCESS;

            console.log(
              chainId,
              "chainswitchstatus",
              checkoutStore.chainSwitchStatus[chainId as ChainId]
            );

            return (
              <>
                {inProgress && (
                  <MRCModalChainStep
                    key={chainId}
                    icon={
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-blue-500 rounded-full">
                        <span className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse-scale" />
                      </span>
                    }
                    line={<div className="flex-grow h-0.5 bg-grey-100"></div>}
                    isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                    chainCount={chainIdsBeingCheckedOut.length}
                  />
                )}
                {isSuccess && (
                  <MRCModalChainStep
                    key={chainId}
                    icon={
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-blue-500 rounded-full">
                        <CheckIcon
                          className="w-5 h-5 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    }
                    line={<div className="flex-grow h-0.5 bg-blue-500"></div>}
                    isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                    chainCount={chainIdsBeingCheckedOut.length}
                  />
                )}
                {notStarted && (
                  <MRCModalChainStep
                    key={chainId}
                    icon={
                      <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 rounded-full border-grey-300"></span>
                    }
                    line={<div className="flex-grow h-0.5 bg-grey-100"></div>}
                    isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                    chainCount={chainIdsBeingCheckedOut.length}
                  />
                )}
              </>
            );
          })}
        </div>
      )}
      <div className="px-2 py-2 font-bold">
        <p>
          <img
            className="inline mr-1 w-5 h-5"
            alt={CHAINS[chainId].name}
            src={CHAINS[chainId].logo}
          />
          {chainIdsBeingCheckedOut.length > 1 ? (
            <span className="font-bold text-[16px]">
              Step {chainIdsBeingCheckedOut.indexOf(Number(chainId)) + 1}:
              Checkout {CHAINS[chainId].name} donations
            </span>
          ) : (
            <span className="font-bold text-[16px]">
              Checkout {CHAINS[chainId].name} donations
            </span>
          )}
        </p>
      </div>
      <nav aria-label="Progress" className="ml-6 mt-2 mb-2">
        <ol className="overflow-hidden">
          {progressSteps.map((step, stepIdx) => (
            <li
              key={stepIdx}
              className={`relative ${
                stepIdx !== progressSteps.length - 1 && "pb-4"
              }`}
            >
              {step.status === ProgressStatus.IS_SUCCESS ? (
                <MRCModalStep
                  step={step}
                  icon={
                    <span
                      className="relative z-10 w-6 h-6 flex items-center justify-center bg-blue-500 rounded-full"
                      data-testid={`${step.name}-complete-icon`}
                    >
                      <CheckIcon
                        className="w-5 h-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  }
                  nameColor={"text-grey-500"}
                  descriptionColor={"text-grey-500"}
                />
              ) : step.status === ProgressStatus.IN_PROGRESS ? (
                <MRCModalStep
                  step={step}
                  icon={
                    <span className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border-2 border-blue-500 rounded-full font-sans text-sm font-medium">
                      <span
                        className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse-scale"
                        data-testid={`${step.name}-current-icon`}
                      />
                    </span>
                  }
                  nameColor="text-black"
                />
              ) : step.status === ProgressStatus.IS_ERROR ? (
                <MRCModalStep
                  step={step}
                  icon={
                    <span className="relative z-10 w-6 h-6 flex items-center justify-center border-2 bg-white border-pink-500 rounded-full">
                      <XMarkIcon
                        className="w-5 h-5 text-pink-500"
                        data-testid={`${step.name}-error-icon`}
                      />
                    </span>
                  }
                  nameColor="text-grey-500"
                />
              ) : step.status === ProgressStatus.NOT_STARTED ? (
                <MRCModalStep
                  step={step}
                  icon={
                    <span
                      className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border-2 rounded-full border-black"
                      data-testid={`${step.name}-upcoming-icon`}
                    ></span>
                  }
                  nameColor="text-black"
                />
              ) : (
                <></>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div>
        <div className="flex justify-start flex-col">
          {permitStatus[chainId as ChainId] === ProgressStatus.IS_ERROR && (
            <p className="text-xs text-grey-400 mt-2 ml-2">
              Transaction rejected or signature denied. Please double check your
              permissions and try again.
            </p>
          )}
          {voteStatus[chainId as ChainId] === ProgressStatus.IS_ERROR && (
            <p className="text-xs text-grey-400 mt-2 ml-2">
              Transaction failed. Please double check your wallet and try again.
              If the problem persists, please contact support for assistance.
            </p>
          )}
        </div>
        {(permitStatus[chainId as ChainId] === ProgressStatus.IS_ERROR ||
          voteStatus[chainId as ChainId] === ProgressStatus.IS_ERROR) && (
          <div className="flex justify-end mt-4 mr-2">
            <Button
              type="button"
              $variant="outline"
              onClick={() => {
                setIsOpen(false);
              }}
              className="inline-flex justify-center px-4 py-2 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              $variant="solid"
              onClick={() => {
                tryAgainFn();
              }}
              className="inline-flex justify-center px-4 py-2 text-sm ml-2"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function MRCModalStep(props: {
  step: Step;
  icon: JSX.Element;
  nameColor: string;
  descriptionColor?: string;
  isAriaHidden?: boolean;
  isAriaCurrent?: boolean;
}) {
  return (
    <>
      <div
        className="relative flex items-start group"
        aria-current={!!props.isAriaCurrent}
      >
        <span
          className="h-9 flex items-center"
          aria-hidden={!!props.isAriaHidden}
        >
          {props.icon}
        </span>
        <span className="ml-2 w-full flex flex-col">
          {/* <span
            className={`flex justify-start text-xs font-semibold tracking-wide uppercase ${props.nameColor}`}
          >
            {props.step.name}
          </span> */}
          <span
            className={`flex justify-start text-sm mt-2 font-normal font-sans ${
              props.descriptionColor ?? "text-grey-400"
            }`}
          >
            {props.step.description}
          </span>
        </span>
      </div>
    </>
  );
}

function MRCModalChainStep(props: {
  icon: JSX.Element;
  line: JSX.Element;
  isAriaHidden?: boolean;
  isAriaCurrent?: boolean;
  isLastStep?: boolean;
  chainCount?: number;
}) {
  let widthClass = "";
  if (props.chainCount) {
    switch (props.chainCount) {
      case 2:
        widthClass = "w-full";
        break;
      case 3:
        widthClass = "w-1/2";
        break;
      case 4:
        widthClass = "w-1/3";
        break;
      default:
        widthClass = "w-full";
        break;
    }
  }
  return (
    <div className={`flex items-center ${props.isLastStep ? "" : widthClass}`}>
      <span
        className="h-9 flex items-center"
        aria-hidden={!!props.isAriaHidden}
      >
        {props.icon}
      </span>
      {!props.isLastStep && props.line}
    </div>
  );
}
