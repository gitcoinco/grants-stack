import React from "react";
import { CartProject, VotingToken } from "../../api/types";
import { ChainId } from "common";
import { CHAINS } from "../../api/utils";
import { useCartStorage } from "../../../store";
import { formatUnits } from "viem";

type ChainConfirmationModalBodyProps = {
  projectsByChain: { [chain: number]: CartProject[] };
  totalDonationsPerChain: { [chain: number]: bigint };
  chainIdsBeingCheckedOut: number[];
  setChainIdsBeingCheckedOut: React.Dispatch<React.SetStateAction<number[]>>;
};

export function ChainConfirmationModalBody({
  projectsByChain,
  totalDonationsPerChain,
  chainIdsBeingCheckedOut,
  setChainIdsBeingCheckedOut,
}: ChainConfirmationModalBodyProps) {
  const handleChainCheckboxChange = (chainId: number, checked: boolean) => {
    if (checked) {
      setChainIdsBeingCheckedOut((prevChainIds) =>
        prevChainIds.includes(chainId)
          ? prevChainIds
          : [...prevChainIds, chainId]
      );
    } else {
      setChainIdsBeingCheckedOut((prevChainIds) =>
        prevChainIds.filter((id) => id !== chainId)
      );
    }
  };

  const getVotingTokenForChain = useCartStorage(
    (state) => state.getVotingTokenForChain
  );
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
            selectedPayoutToken={getVotingTokenForChain(
              Number(chainId) as ChainId
            )}
            totalDonation={totalDonationsPerChain[Number(chainId)]}
            checked={chainIdsBeingCheckedOut.includes(Number(chainId))}
            onChange={(checked) =>
              handleChainCheckboxChange(Number(chainId), checked)
            }
            isLastItem={index === Object.keys(projectsByChain).length - 1}
          />
        ))}
      </div>
    </>
  );
}

type ChainSummaryProps = {
  totalDonation: bigint;
  selectedPayoutToken: VotingToken;
  chainId: ChainId;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isLastItem: boolean;
};

export function ChainSummary({
  selectedPayoutToken,
  totalDonation,
  chainId,
  checked,
  onChange,
  isLastItem,
}: ChainSummaryProps) {
  return (
    <div
      className={`flex flex-col justify-center mt-2 font-semibold ${
        isLastItem ? "" : "border-b"
      } px-2 py-4`}
    >
      <p>
        <input
          type="checkbox"
          className="mr-2 rounded-sm"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <img
          className="inline mr-2 w-5 h-5"
          alt={CHAINS[chainId].name}
          src={CHAINS[chainId].logo}
        />
        Checkout {CHAINS[chainId].name} cart
      </p>
      <p className="ml-7 mt-1">
        <span data-testid={"totalDonation"} className="mr-2">
          {formatUnits(totalDonation, selectedPayoutToken.decimal)}
        </span>
        <span data-testid={"chainSummaryPayoutToken"}>
          {selectedPayoutToken.name} to be contributed
        </span>
      </p>
    </div>
  );
}
