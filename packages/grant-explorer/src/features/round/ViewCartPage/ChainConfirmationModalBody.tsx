import React from "react";
import { CartProject } from "../../api/types";
import { TToken, getChainById, stringToBlobUrl } from "common";
import { useCartStorage } from "../../../store";
import { formatUnits } from "viem";
import { parseChainId } from "common/src/chains";
import { Checkbox } from "@chakra-ui/react";

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
        {Object.keys(projectsByChain)
          .map(parseChainId)
          .filter((chainId) => chainIdsBeingCheckedOut.includes(chainId))
          .map((chainId, index) => (
            <ChainSummary
              chainId={chainId}
              selectedPayoutToken={getVotingTokenForChain(chainId)}
              totalDonation={totalDonationsPerChain[chainId]}
              checked={chainIdsBeingCheckedOut.includes(chainId)}
              chainsBeingCheckedOut={chainIdsBeingCheckedOut.length}
              onChange={(checked) =>
                handleChainCheckboxChange(chainId, checked)
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
  selectedPayoutToken: TToken;
  chainId: number;
  checked: boolean;
  chainsBeingCheckedOut: number;
  onChange: (checked: boolean) => void;
  isLastItem: boolean;
};

export function ChainSummary({
  selectedPayoutToken,
  totalDonation,
  chainId,
  checked,
  chainsBeingCheckedOut,
  onChange,
  isLastItem,
}: ChainSummaryProps) {

  const chain = getChainById(chainId);

  return (
    <div
      className={`flex flex-col justify-center mt-2 ${
        isLastItem ? "" : "border-b"
      } py-4`}
    >
      <p className="font-sans font-medium">
        <Checkbox
          className={`mr-2 mt-1  ${
            chainsBeingCheckedOut === 1 ? "invisible" : ""
          }`}
          border={"1px"}
          borderRadius={"4px"}
          colorScheme="whiteAlpha"
          iconColor="black"
          size="lg"
          isChecked={checked}
          disabled={chainsBeingCheckedOut === 1}
          onChange={(e) => onChange(e.target.checked)}
        />
        <img
          className="inline mr-2 w-5 h-5"
          alt={chain.prettyName}
          src={stringToBlobUrl(chain.icon)}
        />
        <span className="font-sans font-medium">
          Checkout {chain.prettyName} cart
        </span>
      </p>
      <p className="ml-7 mt-2">
        <span data-testid={"totalDonation"} className="mr-2">
          {formatUnits(totalDonation, selectedPayoutToken.decimals)}
        </span>
        <span data-testid={"chainSummaryPayoutToken"}>
          {selectedPayoutToken.code} to be contributed
        </span>
      </p>
    </div>
  );
}
