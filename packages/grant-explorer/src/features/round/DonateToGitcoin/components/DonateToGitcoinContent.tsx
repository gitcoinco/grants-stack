import {
  getChainById,
  getTokenPrice,
  stringToBlobUrl,
  TChain,
  TToken,
} from "common";
import { useState, useRef, useEffect, useMemo } from "react";

import {
  useDonateToGitcoin,
  GITCOIN_RECIPIENT_CONFIG,
} from "../../DonateToGitcoinContext";
import { DonationInput } from "./DonationInput";

import React from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useCartStorage } from "../../../../store";
import { parseUnits } from "viem";

type DonateToGitcoinContentProps = {
  totalAmount: string;
  totalDonationsByChain: {
    [chainId: number]: number;
  };
};

export const DonateToGitcoinContent = React.memo(
  ({ totalAmount, totalDonationsByChain }: DonateToGitcoinContentProps) => {
    const {
      isEnabled,
      selectedChainId,
      amount,
      selectedChain,
      chains,
      tokenBalances,
      tokenFilters,
      setSelectedChainId,
      setSelectedToken,
      setAmountInWei,
    } = useDonateToGitcoin();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const { votingTokens, tokenAmountInfo } = useMemo(() => {
      if (!tokenFilters) {
        return { votingTokens: {}, tokenAmountInfo: null };
      }

      const votingTokens = tokenFilters.reduce(
        (acc, { chainId }) => {
          const votingToken = useCartStorage
            .getState()
            .getVotingTokenForChain(chainId);
          const token = getChainById(chainId)?.tokens.find(
            (t) => t.address.toLowerCase() === votingToken.address.toLowerCase()
          );

          return {
            ...acc,
            [chainId]: {
              address: votingToken.address,
              token,
            },
          };
        },
        {} as {
          [chainId: number]: { address: string; token: TToken | undefined };
        }
      );

      const tokenAmountInfo = selectedChainId
        ? {
            token: votingTokens[selectedChainId].token,
          }
        : null;

      return { votingTokens, tokenAmountInfo };
    }, [tokenFilters, selectedChainId]);

    const [tokenAmount, setTokenAmount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Filter chains to only show Gitcoin supported ones
    const supportedChains = useMemo(
      () => chains.filter((chain) => chain.id in GITCOIN_RECIPIENT_CONFIG),
      [chains]
    );

    // Handle initial setup
    useEffect(() => {
      if (supportedChains.length === 1 && !selectedChainId) {
        setSelectedChainId(supportedChains[0].id);
      }
      setIsInitialized(true);
    }, [supportedChains, selectedChainId, setSelectedChainId]);

    useEffect(() => {
      let isMounted = true;

      const updateTokenAmount = async () => {
        try {
          setIsLoading(true);

          if (!selectedChainId || !amount) {
            setAmountInWei(0n);
            setTokenAmount(0);
            setError(
              !selectedChainId
                ? "Please select a chain"
                : !amount
                  ? "Please enter an amount"
                  : amount === "0"
                    ? "Amount must be greater than 0"
                    : null
            );
            return;
          }

          const votingToken = votingTokens[selectedChainId]?.token;
          if (!votingToken) {
            setError("Selected token not found");
            setTokenAmount(0);
            setAmountInWei(0n);
            return;
          }

          setSelectedToken(votingToken.address);

          const price = await getTokenPrice(
            votingToken.redstoneTokenId,
            votingToken.priceSource
          );

          if (!isMounted) return;

          if (!price || price <= 0) {
            setError("Unable to fetch token price");
            setTokenAmount(0);
            setAmountInWei(0n);
            return;
          }

          const calculatedAmount =
            Number(amount) === 0 ? 0 : Number(amount) / Number(price);
          const balance = Number(
            tokenBalances[selectedChainId]?.[votingToken.address]?.toFixed(5) ||
              0
          );
          const existingDonations = totalDonationsByChain[selectedChainId] || 0;
          const totalRequiredAmount = calculatedAmount + existingDonations;

          if (calculatedAmount === 0) {
            setError("Amount must be greater than 0");
            setTokenAmount(0);
            setAmountInWei(0n);
            return;
          }

          if (totalRequiredAmount > balance) {
            setError(`Insufficient balance for total donations on this chain`);
            setTokenAmount(calculatedAmount);
            setAmountInWei(0n);
            return;
          }

          if (isMounted) {
            setError(null);
            setTokenAmount(calculatedAmount);
            setAmountInWei(
              parseUnits(String(calculatedAmount), votingToken.decimals)
            );
          }
        } catch (err) {
          console.error("Error in token amount calculation:", err);
          if (isMounted) {
            setError("Error calculating token amount");
            setTokenAmount(0);
            setAmountInWei(0n);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      updateTokenAmount();

      return () => {
        isMounted = false;
      };
    }, [
      selectedChainId,
      amount,
      votingTokens,
      setSelectedToken,
      setAmountInWei,
      tokenBalances,
      totalDonationsByChain,
    ]);

    if (!isEnabled || !isInitialized) return null;

    const renderChainOption = (chain: TChain) => {
      const votingInfo = votingTokens[chain.id];
      const balance =
        tokenBalances[chain.id]?.[votingInfo?.address || ""]?.toFixed(5);

      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <img
              className="w-5 h-5"
              alt={chain.prettyName}
              src={stringToBlobUrl(chain.icon)}
            />
            <span className="text-[12px]">{chain.prettyName}</span>
          </div>
          <span className="text-[11px] text-gray-500">
            Balance: {balance} {votingInfo?.token?.code}
          </span>
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-[9px] w-full">
        <DonationInput totalAmount={Number(totalAmount).toFixed(2)} />

        <div className="flex flex-col gap-[6px]">
          <span className="font-inter text-[12px] font-medium text-foreground">
            Add to listed transaction
          </span>

          <div className="relative flex items-center rounded-lg flex-grow w-full">
            {supportedChains.length === 1 ? (
              <div className="w-full p-[9px] rounded-[6px] border-[0.75px] border-[#D7D7D7] bg-white font-modern-era font-medium">
                {renderChainOption(supportedChains[0])}
              </div>
            ) : (
              <>
                <div
                  ref={dropdownRef}
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full p-[9px] cursor-pointer rounded-[6px] border-[0.75px] border-[#D7D7D7] bg-white font-modern-era font-medium"
                >
                  {selectedChain ? (
                    <div className="flex items-center justify-between w-full">
                      {renderChainOption(selectedChain)}
                      <ChevronDownIcon className="w-5 h-5 ml-2" />
                    </div>
                  ) : (
                    <span className="text-[12px]">Select chain</span>
                  )}
                </div>

                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D7D7D7] rounded-[6px] shadow-lg z-10">
                    {supportedChains
                      .sort((a, b) => a.prettyName.localeCompare(b.prettyName))
                      .map((chain) => (
                        <div
                          key={chain.id}
                          onClick={() => {
                            setSelectedChainId(chain.id);
                            setIsOpen(false);
                          }}
                          className="p-[9px] hover:bg-gray-50 cursor-pointer"
                        >
                          {renderChainOption(chain)}
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          {selectedChain && tokenAmountInfo && (
            <div className="flex justify-between items-center font-inter text-[11px] font-medium text-foreground">
              <span>Donation total</span>
              <span>
                {isLoading
                  ? "Calculating..."
                  : `${tokenAmount.toFixed(5)} ${tokenAmountInfo.token?.code}`}
              </span>
            </div>
          )}
        </div>

        {isInitialized && error && (
          <p className="text-[11px] text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
