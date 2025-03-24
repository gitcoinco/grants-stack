import { useState, Fragment, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { getChains, NATIVE } from "common";
import { useAccount } from "wagmi";
import { getBalance } from "@wagmi/core";
import { config } from "../../app/wagmi";
import React from "react";
import { zeroAddress } from "viem";
import { stringToBlobUrl } from "common";
import { Checkbox } from "@chakra-ui/react";

type DonateToGitcoinProps = {
  divider?: "none" | "top" | "bottom";
};

export function DonateToGitcoin({ divider = "none" }: DonateToGitcoinProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const chains = getChains().filter((c) => c.type === "mainnet");
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [tokenBalances, setTokenBalances] = useState<
    { token: string; balance: number }[]
  >([]);

  const selectedChain = selectedChainId
    ? chains.find((c) => c.id === selectedChainId)
    : null;
  const tokenDetails = selectedChain?.tokens.find(
    (t) => t.address === selectedToken
  );
  const { address } = useAccount();

  const handleCheckboxChange = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      // Reset form when checkbox is unchecked
      setSelectedChainId(null);
      setSelectedToken("");
      setAmount("");
      setTokenBalances([]);
    }
  };

  React.useEffect(() => {
    if (!address || !selectedChain) return;

    const fetchBalances = async () => {
      const balances = await Promise.all(
        selectedChain.tokens
          .filter((token) => token.address !== zeroAddress)
          .map(async (token) => {
            const { value } = await getBalance(config, {
              address,
              token:
                token.address.toLowerCase() === NATIVE.toLowerCase()
                  ? undefined
                  : token.address,
              chainId: selectedChainId,
            });
            return {
              token: token.address,
              balance: Number(value) / 10 ** (token.decimals || 18),
            };
          })
      );
      setTokenBalances(balances);
    };

    fetchBalances();
  }, [address, selectedChainId, selectedChain]);

  const selectedTokenBalance =
    tokenBalances.find(
      (b) => b.token.toLowerCase() === selectedToken.toLowerCase()
    )?.balance || 0;

  const isAmountValid = useMemo(() => {
    if (!amount || !selectedToken) return true;
    const numAmount = Number(amount);
    return numAmount > 0 && numAmount <= selectedTokenBalance;
  }, [amount, selectedToken, selectedTokenBalance]);

  const borderClass = useMemo(() => {
    switch (divider) {
      case "top":
        return "border-t";
      case "bottom":
        return "border-b";
      default:
        return "";
    }
  }, [divider]);

  return (
    <div className={`flex flex-col justify-center mt-2 py-4 ${borderClass}`}>
      <div className={`${!isEnabled ? "opacity-50" : ""}`}>
        <p className="font-sans font-medium flex items-center">
          <Checkbox
            className="mr-2"
            border={"1px"}
            borderRadius={"4px"}
            colorScheme="whiteAlpha"
            iconColor="black"
            size="lg"
            isChecked={isEnabled}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
          />
          <img
            className="inline mr-2 w-5 h-5"
            alt="Gitcoin"
            src="/logos/gitcoin-gist-logo.svg"
          />
          <span className="font-sans font-medium">Donate to Gitcoin</span>
        </p>
      </div>

      {isEnabled && (
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
                onChange={(e) => {
                  const newChainId = Number(e.target.value);
                  setSelectedChainId(newChainId || null);
                  setSelectedToken("");
                  setAmount("");
                }}
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
              <Listbox value={selectedToken} onChange={setSelectedToken}>
                <div className="relative">
                  <Listbox.Button className="relative w-40 cursor-default rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-left text-sm shadow-sm hover:border-gray-300">
                    {selectedToken ? (
                      <div className="flex justify-between items-center">
                        <span>
                          {
                            selectedChain?.tokens.find(
                              (t) =>
                                t.address.toLowerCase() ===
                                selectedToken.toLowerCase()
                            )?.code
                          }
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {selectedTokenBalance.toFixed(3)}
                        </span>
                      </div>
                    ) : (
                      "Select token"
                    )}
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options
                      className="absolute z-50 mt-1 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5"
                      style={{ maxHeight: "40vh" }}
                    >
                      <div className="max-h-[40vh] overflow-y-auto">
                        {selectedChain?.tokens
                          .filter((token) => token.address !== zeroAddress)
                          .sort((a, b) => {
                            // NATIVE token always first
                            if (
                              a.address.toLowerCase() === NATIVE.toLowerCase()
                            )
                              return -1;
                            if (
                              b.address.toLowerCase() === NATIVE.toLowerCase()
                            )
                              return 1;

                            // Get balances
                            const balanceA =
                              tokenBalances.find(
                                (b) =>
                                  b.token.toLowerCase() ===
                                  a.address.toLowerCase()
                              )?.balance || 0;
                            const balanceB =
                              tokenBalances.find(
                                (b) =>
                                  b.token.toLowerCase() ===
                                  b.token.toLowerCase()
                              )?.balance || 0;

                            // Sort by balance (highest to lowest)
                            if (balanceA === 0 && balanceB === 0) return 0;
                            if (balanceA === 0) return 1;
                            if (balanceB === 0) return -1;
                            return balanceB - balanceA;
                          })
                          .map((token) => {
                            const balance =
                              tokenBalances.find(
                                (b) =>
                                  b.token.toLowerCase() ===
                                  token.address.toLowerCase()
                              )?.balance || 0;
                            return (
                              <Listbox.Option
                                key={token.address}
                                value={token.address}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                    active ? "bg-gray-50" : ""
                                  }`
                                }
                              >
                                <div className="flex justify-between items-center">
                                  <span>{token.code}</span>
                                  <span className="text-xs text-gray-500">
                                    {balance.toFixed(3)}
                                  </span>
                                </div>
                              </Listbox.Option>
                            );
                          })}
                      </div>
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>

              <div className="relative flex-grow max-w-[200px]">
                <input
                  type="number"
                  className={`w-full rounded-lg border py-2 px-3 text-sm shadow-sm hover:border-gray-300 ${
                    isAmountValid ? "border-gray-200" : "border-red-300"
                  }`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={selectedTokenBalance}
                />
                {selectedToken && (
                  <div className="absolute right-3 top-2.5 text-xs text-gray-500">
                    {tokenDetails?.code}
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAmountValid && amount && (
            <p className="text-sm text-red-500">
              Amount must be greater than 0 and less than your balance
            </p>
          )}
        </div>
      )}
    </div>
  );
}
