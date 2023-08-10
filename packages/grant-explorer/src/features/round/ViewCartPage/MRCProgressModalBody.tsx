import React from "react";
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
  steps: Step[];
  tryAgainFn: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function MRCProgressModalBody({
  chainIdsBeingCheckedOut,
  steps,
  tryAgainFn,
  setIsOpen,
}: MRCProgressModalBodyProps) {
  const checkoutStore = useCheckoutStore();
  const permitStatus = checkoutStore.permitStatus;
  const voteStatus = checkoutStore.voteStatus;
  const chainId = (checkoutStore.currentChainBeingCheckedOut ??
    chainIdsBeingCheckedOut[0]) as ChainId;

  return (
    <>
      {chainIdsBeingCheckedOut.length > 1 && (
        <div className="flex py-2 justify-between">
          {chainIdsBeingCheckedOut.map((chainId, idx) => (
            <>
              {checkoutStore.voteStatus[chainId as ChainId] ===
              ProgressStatus.IN_PROGRESS ? (
                <MRCModalChainStep
                  key={chainId}
                  icon={
                    <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-violet-500 rounded-full">
                      <span className="h-2.5 w-2.5 bg-violet-500 rounded-full animate-pulse-scale" />
                    </span>
                  }
                  line={<div className="flex-grow h-0.5 bg-grey-100"></div>}
                  isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                  chainCount={chainIdsBeingCheckedOut.length}
                />
              ) : checkoutStore.voteStatus[chainId as ChainId] ===
                ProgressStatus.IS_SUCCESS ? (
                <MRCModalChainStep
                  key={chainId}
                  icon={
                    <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-teal-500 rounded-full">
                      <CheckIcon
                        className="w-5 h-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  }
                  line={<div className="flex-grow h-0.5 bg-teal-500"></div>}
                  isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                  chainCount={chainIdsBeingCheckedOut.length}
                />
              ) : checkoutStore.voteStatus[chainId as ChainId] ===
                ProgressStatus.IS_ERROR ? (
                <MRCModalChainStep
                  key={chainId}
                  icon={
                    <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-violet-500 rounded-full">
                      <span className="h-2.5 w-2.5 bg-violet-500 rounded-full animate-pulse-scale" />
                    </span>
                  }
                  line={<div className="flex-grow h-0.5 bg-grey-100"></div>}
                  isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                  chainCount={chainIdsBeingCheckedOut.length}
                />
              ) : checkoutStore.voteStatus[chainId as ChainId] ===
                ProgressStatus.NOT_STARTED ? (
                <MRCModalChainStep
                  key={chainId}
                  icon={
                    <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 rounded-full border-grey-400"></span>
                  }
                  line={<div className="flex-grow h-0.5 bg-grey-100"></div>}
                  isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                  chainCount={chainIdsBeingCheckedOut.length}
                />
              ) : (
                <></>
              )}
            </>
          ))}
        </div>
      )}
      <div className="px-2 py-2 font-bold">
        <p>
          <img
            className="inline mr-2 w-5 h-5"
            alt={CHAINS[chainId].name}
            src={CHAINS[chainId].logo}
          />
          Step {chainIdsBeingCheckedOut.indexOf(Number(chainId)) + 1}: Checkout{" "}
          {CHAINS[chainId].name} donations
        </p>
      </div>
      <nav aria-label="Progress" className="ml-4 mt-2 mb-2">
        <ol className="overflow-hidden">
          {steps.map((step, stepIdx) => (
            <li
              key={stepIdx}
              className={`relative ${stepIdx !== steps.length - 1 && "pb-4"}`}
            >
              {step.status === ProgressStatus.IS_SUCCESS ? (
                <MRCModalStep
                  step={step}
                  icon={
                    <span
                      className="relative z-10 w-6 h-6 flex items-center justify-center bg-teal-500 rounded-full"
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
                    <span className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border-2 border-violet-500 rounded-full">
                      <span
                        className="h-2.5 w-2.5 bg-violet-500 rounded-full"
                        data-testid={`${step.name}-current-icon`}
                      />
                    </span>
                  }
                  nameColor="text-violet-500"
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
                      className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border-2 rounded-full border-grey-400"
                      data-testid={`${step.name}-upcoming-icon`}
                    ></span>
                  }
                  nameColor="text-grey-400"
                />
              ) : (
                <></>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div>
        <div className="flex justify-start">
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
    </>
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
        <span className="ml-2 min-w-0 flex flex-col">
          <span
            className={`text-xs font-semibold tracking-wide uppercase ${props.nameColor}`}
          >
            {props.step.name}
          </span>
          <span
            className={`text-sm ${props.descriptionColor ?? "text-grey-400"}`}
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
