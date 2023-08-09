import React from "react";
import { BigNumber, ethers } from "ethers";
import { PayoutToken } from "../../api/types";
import { ChainId } from "common";
import { CHAINS, payoutTokens } from "../../api/utils";
import { ProgressStatus } from "../../api/types";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNetwork } from "wagmi";

export type Step = {
  name: string;
  description: string;
  status: ProgressStatus;
};

type MRCProgressModalBodyProps = {
  chainIdsBeingCheckedOut: number[];
  steps: Step[];
};

export function MRCProgressModalBody({
  chainIdsBeingCheckedOut,
  steps,
}: MRCProgressModalBodyProps) {
  const { chain } = useNetwork();
  const chainId = (chain?.id ?? chainIdsBeingCheckedOut[0]) as ChainId;

  const chainStatus = "IN_PROGRESS" as ProgressStatus;
  return (
    <>
      {chainIdsBeingCheckedOut.length > 1 && (
        <div className="flex px-2 py-4 justify-between">
          {chainIdsBeingCheckedOut.map((chainId, idx) => (
            <>
              {chainStatus === ProgressStatus.IN_PROGRESS ? (
                <MRCModalChainStep
                  key={chainId}
                  icon={
                    <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-violet-500 rounded-full">
                      <span className="h-2.5 w-2.5 bg-violet-500 rounded-full animate-pulse-scale" />
                    </span>
                  }
                  line={
                    <div
                      className="flex-grow h-0.5 bg-grey-100"
                      style={{ minWidth: "300px" }}
                    ></div>
                  }
                  isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                />
              ) : chainStatus === ProgressStatus.IS_SUCCESS ? (
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
                  line={
                    <div
                      className="flex-grow h-0.5 bg-teal-500"
                      style={{ minWidth: "300px" }}
                    ></div>
                  }
                  isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                />
              ) : chainStatus === ProgressStatus.IS_ERROR ? (
                <MRCModalChainStep
                  key={chainId}
                  icon={
                    <span className="relative z-10 w-8 h-8 flex items-center justify-center border-2 bg-white border-pink-500 rounded-full">
                      <XMarkIcon className="w-5 h-5 text-pink-500" />
                    </span>
                  }
                  line={
                    <div
                      className="flex-grow h-0.5 bg-grey-100"
                      style={{ minWidth: "300px" }}
                    ></div>
                  }
                  isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                />
              ) : chainStatus === ProgressStatus.NOT_STARTED ? (
                <MRCModalChainStep
                  key={chainId}
                  icon={
                    <span className="relative z-10 w-6 h-6 flex items-center justify-center bg-white border-2 rounded-full border-grey-400"></span>
                  }
                  line={
                    <div
                      className="flex-grow h-0.5 bg-grey-100"
                      style={{ minWidth: "300px" }}
                    ></div>
                  }
                  isLastStep={idx === chainIdsBeingCheckedOut.length - 1}
                />
              ) : (
                <></>
              )}
            </>
          ))}
        </div>
      )}
      <div className="px-2 py-4 font-bold">
        <p>
          <img
            className="inline mr-2 w-5 h-5"
            alt={CHAINS[chainId].name}
            src={CHAINS[chainId].logo}
          />
          Step1: Checkout {CHAINS[chainId].name} donations
        </p>
      </div>
      <nav aria-label="Progress" className="ml-4 mt-2 mb-6">
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
        <span className="ml-4 min-w-0 flex flex-col">
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
}) {
  console.log(props);
  return (
    <div className="flex items-center">
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
