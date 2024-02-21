import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { formatUnits } from "viem";
import { VotingToken } from "common";

type ConfirmationModalBodyProps = {
  projectsCount: number;
  totalDonation: bigint;
  selectedPayoutToken: VotingToken;
};

export function ConfirmationModalBody({
  projectsCount,
  selectedPayoutToken,
  totalDonation,
}: ConfirmationModalBodyProps) {
  return (
    <>
      <p className="text-sm text-grey-400">
        Funding {projectsCount} project{projectsCount > 1 && "s"}
      </p>
      <div className="my-8">
        <ProjectsInCartCount
          totalDonation={totalDonation}
          selectedPayoutToken={selectedPayoutToken}
        />
      </div>
      <AdditionalGasFeesNote />
    </>
  );
}

function AdditionalGasFeesNote() {
  return (
    <p className="text-sm italic text-grey-400 mb-2">
      Changes could be subject to additional gas fees.
    </p>
  );
}

type ProjectsInCartCountProps = {
  totalDonation: bigint;
  selectedPayoutToken: VotingToken;
};
export function ProjectsInCartCount({
  totalDonation,
  selectedPayoutToken,
}: ProjectsInCartCountProps) {
  return (
    <div className="flex justify-center" data-testid="cart-project-count">
      <CheckIcon
        className="bg-teal-400 text-grey-500 rounded-full h-6 w-6 p-1 mr-2"
        aria-hidden="true"
      />
      <p className="font-bold">
        <span className="mr-1">
          {formatUnits(totalDonation, selectedPayoutToken.decimal)}
        </span>
        <span className="mr-1">{selectedPayoutToken.name}</span>
        <span>Contributed</span>
      </p>
    </div>
  );
}
