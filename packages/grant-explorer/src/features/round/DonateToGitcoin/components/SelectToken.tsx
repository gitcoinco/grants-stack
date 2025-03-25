import { Fragment, useCallback } from "react";
import { zeroAddress } from "viem";
import { Listbox, Transition } from "@headlessui/react";
import { useDonateToGitcoin } from "../../DonateToGitcoinContext";
import { NATIVE } from "common";

export const SelectToken = () => {
  const {
    selectedToken,
    setSelectedToken,
    setAmount,
    selectedChain,
    filteredTokens,
    selectedTokenBalance,
    tokenBalances,
  } = useDonateToGitcoin();
  const handleTokenChange = useCallback(
    (newToken: string) => {
      setSelectedToken(newToken);
      setAmount("");
    },
    [setSelectedToken, setAmount]
  );
  return (
    <Listbox value={selectedToken} onChange={handleTokenChange}>
      <div className="relative">
        <Listbox.Button className="relative w-40 cursor-default rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-left text-sm shadow-sm hover:border-gray-300">
          {selectedToken ? (
            <div className="flex justify-between items-center">
              <span>
                {
                  selectedChain?.tokens.find(
                    (t) =>
                      t.address.toLowerCase() === selectedToken.toLowerCase()
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
              {(filteredTokens || [])
                .filter((token) => token.address !== zeroAddress)
                .sort((a, b) => {
                  if (a.address.toLowerCase() === NATIVE.toLowerCase())
                    return -1;
                  if (b.address.toLowerCase() === NATIVE.toLowerCase())
                    return 1;

                  const balanceA =
                    tokenBalances.find(
                      (b) => b.token.toLowerCase() === a.address.toLowerCase()
                    )?.balance || 0;
                  const balanceB =
                    tokenBalances.find(
                      (b) => b.token.toLowerCase() === b.token.toLowerCase()
                    )?.balance || 0;

                  if (balanceA === 0 && balanceB === 0) return 0;
                  if (balanceA === 0) return 1;
                  if (balanceB === 0) return -1;
                  return balanceB - balanceA;
                })
                .map((token) => {
                  const balance =
                    tokenBalances.find(
                      (b) =>
                        b.token.toLowerCase() === token.address.toLowerCase()
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
  );
};
