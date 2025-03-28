import { getChainById, getTokenPrice, stringToBlobUrl, TToken } from "common";
import { useState, useRef, useEffect, useMemo } from "react";

import { useDonateToGitcoin } from "../../DonateToGitcoinContext";
import { DonationInput } from "./DonationInput";

import React from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useCartStorage } from "../../../../store";
import { parseUnits } from "viem";

type DonateToGitcoinContentProps = {
  totalAmount: string;
};

export const DonateToGitcoinContent = React.memo(
  ({ totalAmount }: DonateToGitcoinContentProps) => {
    const {
      isEnabled,
      selectedChainId,
      setSelectedChainId,
      setSelectedToken,
      amount,
      setAmountInWei,
      selectedChain,
      chains,
      isAmountValid,
      tokenBalances,
      tokenFilters,
    } = useDonateToGitcoin();

    const [isOpen, setIsOpen] = useState(false);
    const [tokenAmount, setTokenAmount] = useState<number>(0);
    const [token, setToken] = useState<TToken | undefined>(undefined);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const supportedVotingTokenByChainId: { [chainId: number]: string } =
      useMemo(() => {
        const supportedChainIds = tokenFilters?.map((f) => f.chainId) || [];
        return supportedChainIds.reduce(
          (acc, chainId) => ({
            ...acc,
            [chainId]: useCartStorage.getState().getVotingTokenForChain(chainId)
              .address,
          }),
          {}
        );
      }, [tokenFilters]);

    const supportedTokenByChainId: { [chainId: number]: TToken } =
      useMemo(() => {
        const supportedChainIds = tokenFilters?.map((f) => f.chainId) || [];
        return supportedChainIds.reduce(
          (acc, chainId) => ({
            ...acc,
            [chainId]: getChainById(chainId)?.tokens.find(
              (t) =>
                t.address.toLowerCase() ===
                supportedVotingTokenByChainId[chainId].toLowerCase()
            ),
          }),
          {}
        );
      }, [tokenFilters, supportedVotingTokenByChainId]);

    console.log(supportedVotingTokenByChainId);
    console.log(supportedTokenByChainId);
    console.log(tokenBalances);

    const handleChainSelect = (chainId: number) => {
      setSelectedChainId(chainId);
      setSelectedToken("");
      setIsOpen(false);
    };

    useEffect(() => {
      if (selectedChainId) {
        const votingToken = useCartStorage
          .getState()
          .getVotingTokenForChain(selectedChainId);
        setToken(votingToken);
        setSelectedToken(votingToken.address);
        getTokenPrice(
          votingToken.redstoneTokenId,
          votingToken.priceSource
        ).then((price) => {
          const tAmount =
            Number(amount) === 0 ? 0 : Number(amount) / Number(price);
          setTokenAmount(tAmount);
          setAmountInWei(parseUnits(String(tAmount), votingToken.decimals));
        });
      } else {
        setTokenAmount(0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChainId, amount]);

    if (!isEnabled) return null;

    return (
      <div className="flex flex-col gap-[9px] w-full">
        <DonationInput totalAmount={Number(totalAmount).toFixed(2)} />

        <div className="flex flex-col gap-[6px]">
          <span className="font-inter text-[12px] font-medium text-foreground">
            Add to listed transaction
          </span>
          <div className="relative flex items-center rounded-lg flex-grow w-full">
            {chains.length === 1 ? (
              // Single chain display
              <div
                className={`
              flex items-center justify-between w-full
              p-[9px]
              rounded-[6px]
              border-[0.75px] border-[#D7D7D7]
              bg-white
              font-modern-era text-[12px] font-medium text-black
            `}
              >
                <div className="flex items-center">
                  <img
                    className="w-5 h-5 mr-2"
                    alt={chains[0].prettyName}
                    src={stringToBlobUrl(chains[0].icon)}
                  />
                  <span>{chains[0].prettyName}</span>
                </div>
                <span className="text-gray-500">
                  Balance:{" "}
                  {tokenBalances[chains[0].id]?.[
                    supportedVotingTokenByChainId[chains[0].id] || ""
                  ]?.toFixed(5)}{" "}
                  {supportedTokenByChainId[chains[0].id]?.code}
                </span>
              </div>
            ) : (
              // Dropdown for multiple chains
              <div
                ref={dropdownRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                flex justify-between items-center w-full
                p-[9px] cursor-pointer
                rounded-[6px]
                border-[0.75px] border-[#D7D7D7]
                bg-white
                font-modern-era text-[12px] font-medium text-black
              `}
              >
                {selectedChain ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <img
                        className="w-5 h-5"
                        alt={selectedChain.prettyName}
                        src={stringToBlobUrl(selectedChain.icon)}
                      />
                      <span>{selectedChain.prettyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">
                        Balance:{" "}
                        {tokenBalances[selectedChain.id]?.[
                          supportedVotingTokenByChainId[selectedChain.id] || ""
                        ]?.toFixed(5)}{" "}
                        {supportedTokenByChainId[selectedChain.id]?.code}
                      </span>
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                ) : (
                  <span>Select chain</span>
                )}
              </div>
            )}

            {isOpen && chains.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D7D7D7] rounded-[6px] shadow-lg z-10">
                {chains
                  .sort((a, b) => a.prettyName.localeCompare(b.prettyName))
                  .map((chain) => (
                    <div
                      key={chain.id}
                      onClick={() => handleChainSelect(chain.id)}
                      className="flex items-center justify-between p-[9px] hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          className="w-5 h-5"
                          alt={chain.prettyName}
                          src={stringToBlobUrl(chain.icon)}
                        />
                        <span className="font-modern-era text-[12px] font-medium">
                          {chain.prettyName}
                        </span>
                      </div>
                      <span className="font-modern-era text-[12px] font-medium text-gray-500">
                        Balance:{" "}
                        {tokenBalances[chain.id]?.[
                          supportedVotingTokenByChainId[chain.id] || ""
                        ]?.toFixed(5)}{" "}
                        {supportedTokenByChainId[chain.id]?.code}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {selectedChain && (
            <div className="flex justify-between items-center">
              <span className="font-inter text-[12px] font-medium text-foreground">
                Donation total
              </span>
              <span className="font-inter text-[12px] font-medium text-foreground">
                {tokenAmount.toFixed(5)} {token?.code}
              </span>
            </div>
          )}
        </div>

        {!isAmountValid && amount && (
          <p className="text-sm text-red-500">
            Amount must be greater than 0 and less than your balance
          </p>
        )}
      </div>
    );
  }
);
