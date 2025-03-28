import React, { useEffect, useMemo } from "react";
import { CartProject } from "../../api/types";
import { NATIVE, TToken, getChainById, stringToBlobUrl } from "common";
import { useCartStorage } from "../../../store";
import { parseChainId } from "common/src/chains";
import { Checkbox } from "@chakra-ui/react";
import { DonateToGitcoin } from "../DonateToGitcoin";
import { zeroAddress } from "viem";
import { useDonateToGitcoin } from "../DonateToGitcoinContext";
import { TotalAmountInclGitcoinDonation } from "../DonateToGitcoin/components/TotalAmountInclGitcoinDonation";

type ChainConfirmationModalBodyProps = {
  projectsByChain: { [chain: number]: CartProject[] };
  totalDonationsPerChain: { [chain: number]: number };
  chainIdsBeingCheckedOut: number[];
  enoughBalanceByChainId: Record<number, boolean>;
  setChainIdsBeingCheckedOut: React.Dispatch<React.SetStateAction<number[]>>;
  handleSwap: (chainId: number) => void;
  totalDonationAcrossChainsInUSD: number;
};

export function ChainConfirmationModalBody({
  projectsByChain,
  totalDonationsPerChain,
  chainIdsBeingCheckedOut,
  enoughBalanceByChainId,
  setChainIdsBeingCheckedOut,
  handleSwap,
  totalDonationAcrossChainsInUSD,
}: ChainConfirmationModalBodyProps) {
  const { setTokenFilters } = useDonateToGitcoin();
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

  const parsedChainIds = useMemo(
    () => Object.keys(projectsByChain).map(parseChainId),
    [projectsByChain]
  );

  const tokenFilters = useMemo(
    () =>
      parsedChainIds.map((chainId) => ({
        chainId,
        addresses: [
          getVotingTokenForChain(chainId).address === zeroAddress
            ? NATIVE
            : getVotingTokenForChain(chainId).address,
        ],
      })),
    [parsedChainIds, getVotingTokenForChain]
  );

  useEffect(() => {
    setTokenFilters(tokenFilters);
  }, [tokenFilters, setTokenFilters]);

  return (
    <div className="flex flex-col">
      <p className="text-sm text-grey-400">
        {chainIdsBeingCheckedOut.length > 1 && (
          <>
            Checkout all your carts across different networks or select the cart
            you wish to checkout now.
          </>
        )}
      </p>
      <div className="">
        <div className="flex flex-col border-b border-[#D7D7D7] py-6">
          <span className="font-inter text-[15px] font-medium text-black pb-2">
            Networks
          </span>
          {parsedChainIds
            .filter((chainId) => chainIdsBeingCheckedOut.includes(chainId))
            .map((chainId, index) => (
              <ChainSummary
                key={chainId}
                chainId={chainId}
                selectedPayoutToken={getVotingTokenForChain(chainId)}
                totalDonation={totalDonationsPerChain[chainId]}
                checked={
                  chainIdsBeingCheckedOut.includes(chainId) &&
                  enoughBalanceByChainId[chainId]
                }
                chainsBeingCheckedOut={chainIdsBeingCheckedOut.length}
                onChange={(checked) =>
                  handleChainCheckboxChange(chainId, checked)
                }
                // isLastItem={index === Object.keys(projectsByChain).length - 1}
                isLastItem={true}
                notEnoughBalance={!enoughBalanceByChainId[chainId]}
                handleSwap={() => handleSwap(chainId)}
              />
            ))}
        </div>
        <div className="">
          <div className="flex justify-between items-center py-3 mb-6 border-b border-[#D7D7D7]">
            <span className="font-inter text-[15px] font-medium text-black">
              Subtotal
            </span>
            <span className="font-inter text-[15px] font-medium text-black">
              ~${totalDonationAcrossChainsInUSD.toFixed(2)}
            </span>
          </div>
          <DonateToGitcoin
            totalAmount={totalDonationAcrossChainsInUSD.toFixed(2)}
            totalDonationsByChain={totalDonationsPerChain}
          />
          <div className="pt-6">
            <div className="flex justify-between items-center py-3 border-y mb-3 border-[#D7D7D7]">
              <span className="font-inter text-[15px] font-medium text-black">
                Total
              </span>
              <TotalAmountInclGitcoinDonation
                totalDonationAcrossChainsInUSD={totalDonationAcrossChainsInUSD}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ChainSummaryProps = {
  totalDonation: number;
  selectedPayoutToken: TToken;
  chainId: number;
  checked: boolean;
  chainsBeingCheckedOut: number;
  notEnoughBalance: boolean;
  onChange: (checked: boolean) => void;
  isLastItem: boolean;
  handleSwap: () => void;
};

export function ChainSummary({
  selectedPayoutToken,
  totalDonation,
  chainId,
  checked,
  chainsBeingCheckedOut,
  notEnoughBalance,
  onChange,
  isLastItem,
  handleSwap,
}: ChainSummaryProps) {
  const chain = getChainById(chainId);

  return (
    <div
      className={`flex flex-col justify-center ${
        isLastItem ? "" : "border-b"
      } py-2`}
    >
      <div
        className={`flex justify-between items-center ${notEnoughBalance ? "opacity-50" : ""}`}
      >
        <div className="flex items-center">
          <Checkbox
            className={`mr-2 ${chainsBeingCheckedOut === 1 ? "invisible" : ""}`}
            border={"1px"}
            borderRadius={"4px"}
            colorScheme="whiteAlpha"
            iconColor="black"
            size="lg"
            isChecked={checked}
            disabled={chainsBeingCheckedOut === 1 || notEnoughBalance}
            onChange={(e) => onChange(e.target.checked)}
          />
          <img
            className="inline mr-2 w-5 h-5"
            alt={chain.prettyName}
            src={stringToBlobUrl(chain.icon)}
          />
          <span className="font-sans font-medium">{chain.prettyName}</span>
        </div>
        <div className="text-right">
          <span
            data-testid={"totalDonation"}
            className="mr-2 font-dm-mono text-[14px] font-medium leading-[21px] text-black"
          >
            {totalDonation}
          </span>
          <span
            data-testid={"chainSummaryPayoutToken"}
            className="font-dm-mono text-[14px] font-medium leading-[21px] text-black"
          >
            {selectedPayoutToken.code}
          </span>
        </div>
      </div>
      {notEnoughBalance && (
        <div className="text-red-500 flex items-center text-sm mt-2">
          <p>
            There are insufficient funds in your wallet to complete your full
            donation. Please{" "}
            <span
              onClick={() => handleSwap()}
              className="cursor-pointer underline"
            >
              bridge
            </span>{" "}
            funds over to {getChainById(chainId).prettyName}.
          </p>
        </div>
      )}
    </div>
  );
}
