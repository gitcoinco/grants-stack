import { createElement, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "common/src/styles";
import { getChains, NATIVE, TChain } from "common";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, parseUnits, zeroAddress } from "viem";
import { sendTransaction } from "@wagmi/core";
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
                {chains.map((c) => (
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
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                <option value="">Select a token</option>
                {selectedChain?.tokens
                  .filter((token) => token.address !== zeroAddress)
                  .map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.code}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>

            <Button
              type="button"
              onClick={handleDonate}
              disabled={!amount || !selectedToken || isPending}
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
  const selectedChain = chains.find((c) => c.id === chainId);

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
