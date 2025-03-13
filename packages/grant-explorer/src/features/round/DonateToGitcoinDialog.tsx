import { createElement, useState, Fragment, useMemo } from "react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import { Button } from "common/src/styles";
import { getChains, NATIVE, TChain, getTokenPrice } from "common";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getAddress, parseEther, parseUnits, zeroAddress } from "viem";
import { getBalance, sendTransaction } from "@wagmi/core";
import { config } from "../../app/wagmi";
import React from "react";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function DonateToGitcoinDialog(props: Props) {
  const chainId = useChainId();
  const chains = getChains();
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: number }>({});

  const selectedChain = chains.find((c) => c.id === chainId);

  const tokenDetails = selectedChain?.tokens.find(
    (t) => t.address === selectedToken
  );

  const isNativeToken = selectedToken.toLowerCase() === NATIVE.toLowerCase();
  const gitcoinAddress = "0x5645bF145C3f1E974D0D7FB91bf3c68592ab5012"; // todo: Replace with actual Gitcoin address

  const { data: simulateData } = useSimulateContract({
    address: selectedToken as `0x${string}`,
    abi: [
      {
        name: "transfer",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
      },
    ],
    functionName: "transfer",
    args: [
      gitcoinAddress as `0x${string}`,
      amount ? parseUnits(amount, tokenDetails?.decimals || 18) : 0n,
    ],
  });

  const { writeContract, isPending, data: writeHash } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const {
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    data: transactionReceipt,
  } = useWaitForTransactionReceipt({
    hash: txHash || writeHash,
  });

  const { address } = useAccount();
  const [tokenBalances, setTokenBalances] = useState<
    { token: string; balance: number }[]
  >([]);

  // Fetch token balances when chain or address changes
  React.useEffect(() => {
    if (!address || !selectedChain) return;

    const fetchBalances = async () => {
      const balances = await Promise.all(
        selectedChain.tokens
          .filter((token) => token.address !== zeroAddress)
          .map(async (token) => {
            const { value } = await getBalance(config, {
              address: getAddress(address),
              token:
                token.address.toLowerCase() === NATIVE.toLowerCase()
                  ? undefined
                  : token.address,
              chainId: chainId,
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
  }, [address, chainId, selectedChain]);

  // Get selected token balance
  const selectedTokenBalance =
    tokenBalances.find(
      (b) => b.token.toLowerCase() === selectedToken.toLowerCase()
    )?.balance || 0;

  // Amount validation
  const isAmountValid = useMemo(() => {
    if (!amount || !selectedToken) return true;
    const numAmount = Number(amount);
    return numAmount > 0 && numAmount <= selectedTokenBalance;
  }, [amount, selectedToken, selectedTokenBalance]);

  // Fetch token prices when chain changes
  React.useEffect(() => {
    if (!selectedChain) return;

    const fetchPrices = async () => {
      const tokensWithBalance = selectedChain.tokens
        .filter((token) => token.address !== zeroAddress)
        .filter((token) => {
          const balance =
            tokenBalances.find(
              (b) => b.token.toLowerCase() === token.address.toLowerCase()
            )?.balance || 0;
          return balance > 0;
        });

      const prices = await Promise.all(
        tokensWithBalance.map(async (token) => {
          try {
            const price = await getTokenPrice(token.redstoneTokenId || "", {
              chainId: selectedChain.id,
              address: token.address as `0x${string}`,
            });
            return { token: token.address, price };
          } catch (error) {
            console.error("Error fetching price for token:", token.code, error);
            return { token: token.address, price: 0 };
          }
        })
      );
      setTokenPrices(
        prices.reduce(
          (acc, { token, price }) => ({ ...acc, [token]: price }),
          {}
        )
      );
    };

    fetchPrices();
  }, [selectedChain, tokenBalances]);

  const handleDonate = async () => {
    if (!amount || !selectedToken) return;
    setStatus("loading");

    try {
      if (isNativeToken) {
        const hash = await sendTransaction(config, {
          to: gitcoinAddress as `0x${string}`,
          value: parseEther(amount),
        });
        setTxHash(hash);
      } else {
        if (simulateData?.request) {
          await writeContract(simulateData.request);
        }
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setStatus("error");
    }
  };

  React.useEffect(() => {
    if (isTransactionSuccess && transactionReceipt) {
      setStatus("success");
    } else if (isTransactionError) {
      setStatus("error");
    }
  }, [isTransactionSuccess, isTransactionError, transactionReceipt]);

  const handleChainSwitch = async (newChainId: number) => {
    try {
      await switchChain({ chainId: newChainId });
      setSelectedToken("");
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  const closeModal = () => {
    setSelectedToken("");
    setAmount("");
    setTxHash(undefined);
    setStatus("idle");
    props.setIsOpen(false);
  };

  const ThankYouScreen = ({ hash, chain }: { hash: string; chain: TChain }) => (
    <div className="text-center space-y-6 py-4">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900">Thank You!</h3>
        <p className="mt-2 text-gray-600">
          Your contribution helps support public goods and makes the web3
          ecosystem stronger.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-500">Transaction Details:</p>
        <a
          href={`${chain?.blockExplorer}tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 break-all"
        >
          View transaction on block explorer
        </a>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-sm text-gray-600 italic">
          "Together, we're building a better future for open source."
        </p>
        <p className="text-sm font-medium">- The Gitcoin Team</p>
      </div>
    </div>
  );

  return (
    <DialogWrapper isOpen={props.isOpen} closeModal={closeModal}>
      <div className="space-y-4">
        {status === "success" && selectedChain ? (
          <ThankYouScreen hash={txHash as string} chain={selectedChain} />
        ) : status === "loading" ? (
          <div className="text-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600">Processing your donation...</p>
            {txHash && (
              <a
                href={`${selectedChain?.blockExplorer}tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 break-all"
              >
                View transaction
              </a>
            )}
          </div>
        ) : (
          <>
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Donate to Gitcoin
            </Dialog.Title>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Network
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={selectedChain?.id}
                onChange={(e) => handleChainSwitch(Number(e.target.value))}
              >
                {chains
                  .sort((a, b) => a.prettyName.localeCompare(b.prettyName))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prettyName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Token
              </label>
              <Listbox value={selectedToken} onChange={setSelectedToken}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <span className="block truncate">
                      {selectedToken ? (
                        <>
                          {
                            selectedChain?.tokens.find(
                              (t) => t.address === selectedToken
                            )?.code
                          }{" "}
                          <span className="text-xs text-gray-500">
                            Balance:{" "}
                            {(
                              tokenBalances.find(
                                (b) =>
                                  b.token.toLowerCase() ===
                                  selectedToken.toLowerCase()
                              )?.balance || 0
                            ).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        "Select a token"
                      )}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-50 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {selectedChain?.tokens
                        .filter((token) => token.address !== zeroAddress)
                        .sort((tokenA, tokenB) => {
                          const balanceA =
                            tokenBalances.find(
                              (bal) =>
                                bal.token.toLowerCase() ===
                                tokenA.address.toLowerCase()
                            )?.balance || 0;
                          const balanceB =
                            tokenBalances.find(
                              (bal) =>
                                bal.token.toLowerCase() ===
                                tokenB.address.toLowerCase()
                            )?.balance || 0;
                          const usdValueA =
                            balanceA * (tokenPrices[tokenA.address] || 0);
                          const usdValueB =
                            balanceB * (tokenPrices[tokenB.address] || 0);
                          return usdValueB - usdValueA;
                        })
                        .map((token) => {
                          const balance =
                            tokenBalances.find(
                              (b) =>
                                b.token.toLowerCase() ===
                                token.address.toLowerCase()
                            )?.balance || 0;
                          const usdValue =
                            balance * (tokenPrices[token.address] || 0);
                          return (
                            <Listbox.Option
                              key={token.address}
                              value={token.address}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                  active ? "bg-gray-100" : "bg-gray-50"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span className="block truncate">
                                    {token.code}{" "}
                                    <span className="text-xs text-gray-500">
                                      Balance: {balance.toFixed(3)} ($
                                      {usdValue.toFixed(2)})
                                    </span>
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600">
                                      <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          );
                        })}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                  isAmountValid
                    ? "border-gray-300 focus:border-indigo-500"
                    : "border-red-300 focus:border-red-500"
                }`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                max={selectedTokenBalance}
              />
              {selectedToken && tokenPrices[selectedToken] && (
                <p className="mt-1 text-sm text-gray-500">
                  ≈ $
                  {amount
                    ? (Number(amount) * tokenPrices[selectedToken]).toFixed(2)
                    : "0.00"}{" "}
                  USD
                </p>
              )}
              {!isAmountValid && (
                <p className="mt-1 text-sm text-red-600">
                  Amount must be greater than 0 and less than your balance (
                  {selectedTokenBalance.toFixed(2)} {tokenDetails?.code})
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={handleDonate}
              disabled={
                !amount || !selectedToken || !isAmountValid || isPending
              }
              className="w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isPending ? "Confirming..." : "Donate"}
            </Button>
          </>
        )}
      </div>
    </DialogWrapper>
  );
}

function DialogWrapper({
  isOpen,
  closeModal,
  children,
}: {
  isOpen: boolean;
  closeModal: () => void;
  children: JSX.Element;
}) {
  const { chainId } = useAccount();
  const chains = getChains();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function DonateToGitcoinButton() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setShowDialog(true);
        }}
        className={`px-4 py-2 text-white rounded-lg text-sm leading-5 font-medium`}
        style={{ background: "var(--moss-700, #22635A)" }}
        data-testid="donate-to-gitcoin-button"
      >
        <div className="flex items-center">
          <span>Donate to Gitcoin</span>
          <img
            src="/logos/gitcoin-gist-logo.svg"
            alt="Gitcoin"
            className="w-4 h-4 ml-1"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      </Button>
      <DonateToGitcoinDialog isOpen={showDialog} setIsOpen={setShowDialog} />
    </>
  );
}
