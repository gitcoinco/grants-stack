import React from "react";
import { BigNumber, ethers } from "ethers";
import { CartProject, PayoutToken } from "../../api/types";
import { ChainId } from "common";
import { CHAINS, payoutTokens } from "../../api/utils";

type ChainConfirmationModalBodyProps = {
  projectsByChain: { [chain: number]: CartProject[] };
  totalDdonationsPerChain: { [chain: number]: BigNumber };
};

export function ChainConfirmationModalBody({
  projectsByChain,
  totalDdonationsPerChain,
}: ChainConfirmationModalBodyProps) {
  return (
    <>
      <p className="text-sm text-grey-400">
        Checkout all your carts across different networks or select the cart you
        wish to checkout now.
      </p>
      <div className="my-4">
        {Object.keys(projectsByChain).map((chainId, index) => (
          <ChainSummary
            chainId={Number(chainId) as ChainId}
            selectedPayoutToken={payoutTokens[Number(chainId) as ChainId]}
            totalDonation={totalDdonationsPerChain[Number(chainId)]}
            isLastItem={index === Object.keys(projectsByChain).length - 1}
          />
        ))}
      </div>
    </>
  );
}

type ChainSummaryProps = {
  totalDonation: BigNumber;
  selectedPayoutToken: PayoutToken;
  chainId: ChainId;
  isLastItem: boolean;
};

export function ChainSummary({
  selectedPayoutToken,
  totalDonation,
  chainId,
  isLastItem,
}: ChainSummaryProps) {
  return (
    <div
      className={`flex flex-col justify-center mt-2 font-semibold ${
        isLastItem ? "" : "border-b"
      } px-2 py-4`}
    >
      <p>
        <input type="checkbox" className="mr-2 rounded-sm" />
        <img
          className="inline mr-2 w-5 h-5"
          alt={CHAINS[chainId].name}
          src={CHAINS[chainId].logo}
        />
        Checkout {CHAINS[chainId].name} cart
      </p>
      <p className="ml-7 mt-1">
        <span data-testid={"totalDonation"} className="mr-2">
          {ethers.utils.formatUnits(totalDonation, selectedPayoutToken.decimal)}
        </span>
        <span data-testid={"chainSummaryPayoutToken"}>
          {selectedPayoutToken.name} to be contributed
        </span>
      </p>
    </div>
  );
}
