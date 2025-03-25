import { stringToBlobUrl } from "common";

import { useDonateToGitcoin } from "../../DonateToGitcoinContext";
import { DonationInput } from "./DonationInput";

import { SelectToken } from "./SelectToken";
import React from "react";

export const DonateToGitcoinContent = React.memo(() => {
  const {
    isEnabled,
    selectedChainId,
    setSelectedChainId,
    setSelectedToken,
    amount,
    setAmount,
    selectedChain,
    chains,
    isAmountValid,
  } = useDonateToGitcoin();

  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChainId = Number(e.target.value);
    setSelectedChainId(newChainId || null);
    setSelectedToken("");
    setAmount("");
  };

  if (!isEnabled) return null;

  return (
    <div className="ml-7 mt-4 space-y-3">
      <div className="flex items-center">
        <div className="relative flex items-center bg-gray-50 rounded-lg p-2 flex-grow max-w-lg">
          {selectedChain && (
            <img
              className="w-5 h-5 mr-2"
              alt={selectedChain.prettyName}
              src={stringToBlobUrl(selectedChain.icon)}
            />
          )}
          <select
            className="bg-transparent border-none focus:ring-0 text-sm flex-grow font-medium"
            value={selectedChainId || ""}
            onChange={handleChainChange}
          >
            <option value="">Select chain</option>
            {chains
              .sort((a, b) => a.prettyName.localeCompare(b.prettyName))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.prettyName}
                </option>
              ))}
          </select>
        </div>
      </div>

      {selectedChain && (
        <div className="flex items-center gap-3">
          <SelectToken />
          <DonationInput />
        </div>
      )}

      {!isAmountValid && amount && (
        <p className="text-sm text-red-500">
          Amount must be greater than 0 and less than your balance
        </p>
      )}
    </div>
  );
});
