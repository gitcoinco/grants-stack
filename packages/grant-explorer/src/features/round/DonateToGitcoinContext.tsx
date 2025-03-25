import React, { createContext, useContext, useState, useCallback } from "react";
import { getBalance } from "@wagmi/core";
import { config } from "../../app/wagmi";
import { NATIVE, getChains } from "common";
import { useAccount } from "wagmi";
import { zeroAddress } from "viem";

type TokenFilter = {
  chainId: number;
  addresses: string[];
};

export type DonationDetails = {
  chainId: number;
  tokenAddress: string;
  amount: string;
};

type DonateToGitcoinContextType = {
  isEnabled: boolean;
  selectedChainId: number | null;
  selectedToken: string;
  amount: string;
  tokenBalances: { token: string; balance: number }[];
  selectedTokenBalance: number;
  setIsEnabled: (enabled: boolean) => void;
  setSelectedChainId: (chainId: number | null) => void;
  setSelectedToken: (token: string) => void;
  setAmount: (amount: string) => void;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTokenChange: (newToken: string) => void;
  handleChainChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCheckboxChange: (checked: boolean) => void;
  onDonationChange?: (details: DonationDetails | null) => void;
};

const DonateToGitcoinContext = createContext<DonateToGitcoinContextType | null>(
  null
);

export function DonateToGitcoinProvider({
  children,
  onDonationChange,
}: {
  children: React.ReactNode;
  tokenFilters?: TokenFilter[];
  onDonationChange?: (details: DonationDetails | null) => void;
}) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenBalances, setTokenBalances] = useState<
    { token: string; balance: number }[]
  >([]);
  const { address } = useAccount();

  const selectedTokenBalance =
    tokenBalances.find(
      (b) => b.token.toLowerCase() === selectedToken.toLowerCase()
    )?.balance || 0;

  // Fetch token balances when chain or address changes
  React.useEffect(() => {
    if (!address || !selectedChainId) return;

    const fetchBalances = async () => {
      const chain = getChains().find((c) => c.id === selectedChainId);
      if (!chain) return;

      const balances = await Promise.all(
        chain.tokens
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
  }, [address, selectedChainId]);

  // Replace the two-part handler with a single handleAmountChange
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setAmount(value);
        if (isEnabled && selectedChainId && selectedToken) {
          onDonationChange?.({
            chainId: selectedChainId,
            tokenAddress: selectedToken,
            amount: value,
          });
        }
      }
    },
    [isEnabled, selectedChainId, selectedToken, onDonationChange]
  );

  const handleTokenChange = useCallback((newToken: string) => {
    setSelectedToken(newToken);
    setAmount("");
  }, []);

  const handleChainChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newChainId = Number(e.target.value);
      setSelectedChainId(newChainId || null);
      setSelectedToken("");
      setAmount("");
    },
    []
  );

  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      setIsEnabled(checked);
      if (!checked) {
        setSelectedChainId(null);
        setSelectedToken("");
        setAmount("");
        setTokenBalances([]);
        onDonationChange?.(null);
      }
    },
    [onDonationChange]
  );

  const value = {
    isEnabled,
    selectedChainId,
    selectedToken,
    amount,
    tokenBalances,
    selectedTokenBalance,
    setIsEnabled,
    setSelectedChainId,
    setSelectedToken,
    setAmount,
    handleAmountChange,
    handleTokenChange,
    handleChainChange,
    handleCheckboxChange,
    onDonationChange,
  };

  return (
    <DonateToGitcoinContext.Provider value={value}>
      {children}
    </DonateToGitcoinContext.Provider>
  );
}

export function useDonateToGitcoin() {
  const context = useContext(DonateToGitcoinContext);
  if (!context) {
    throw new Error(
      "useDonateToGitcoin must be used within a DonateToGitcoinProvider"
    );
  }
  return context;
}
