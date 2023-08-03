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
      <div className="my-8">
        {Object.keys(projectsByChain).map((chainId) => (
          <ChainSummary
            chainId={Number(chainId) as ChainId}
            selectedPayoutToken={payoutTokens[Number(chainId) as ChainId]}
            totalDonation={totalDdonationsPerChain[Number(chainId)]}
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
};

export function ChainSummary({
  selectedPayoutToken,
  totalDonation,
  chainId,
}: ChainSummaryProps) {
  return (
    <div className="flex flex-col justify-between mt-4 text-bold">
      <p>
        <img
          className="inline mr-2"
          alt={CHAINS[chainId].name}
          src={CHAINS[chainId].logo}
        />
        Checkout {CHAINS[chainId].name} cart
      </p>
      <p>
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
