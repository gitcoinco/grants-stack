import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { getBalance } from "@wagmi/core";
import { config } from "../../app/wagmi";
import { NATIVE, getChains, TChain, TToken } from "common";
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
  isAmountValid: boolean;
  tokenFilters?: TokenFilter[];
  chains: TChain[];
  selectedChain: TChain | null;
  filteredTokens?: TToken[];
  tokenDetails: TToken | undefined;
  setIsEnabled: (enabled: boolean) => void;
  setSelectedChainId: (chainId: number | null) => void;
  setSelectedToken: (token: string) => void;
  setAmount: (amount: string) => void;
  setTokenFilters: (filters: TokenFilter[]) => void;
};

const DonateToGitcoinContext = createContext<DonateToGitcoinContextType | null>(
  null
);

export function DonateToGitcoinProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenBalances, setTokenBalances] = useState<
    { token: string; balance: number }[]
  >([]);
  const { address } = useAccount();

  const [tokenFilters, setTokenFilters] = useState<TokenFilter[] | undefined>(
    undefined
  );

  const chains = useMemo(() => {
    const allChains = getChains().filter((c) => c.type === "mainnet");
    if (!tokenFilters) return allChains;
    return allChains.filter((chain) =>
      tokenFilters.some((filter) => filter.chainId === chain.id)
    );
  }, [tokenFilters]);

  const selectedChain = selectedChainId
    ? chains.find((c) => c.id === selectedChainId) || null
    : null;

  const selectedTokenBalance = useMemo(
    () =>
      tokenBalances.find(
        (b) => b.token.toLowerCase() === selectedToken.toLowerCase()
      )?.balance || 0,
    [tokenBalances, selectedToken]
  );

  const isAmountValid = useMemo(() => {
    if (!amount || !selectedToken) return true;
    const numAmount = Number(amount);
    return (
      !isNaN(numAmount) &&
      (amount.endsWith(".") || numAmount > 0) &&
      numAmount <= selectedTokenBalance
    );
  }, [amount, selectedToken, selectedTokenBalance]);

  useEffect(() => {
    if (!address || !selectedChainId) return;
    const fetchBalances = async () => {
      if (!selectedChain) return;

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

  useEffect(() => {
    if (!isEnabled) {
      setSelectedChainId(null);
      setSelectedToken("");
      setAmount("");
      setTokenBalances([]);
    }
  }, [isEnabled, setSelectedChainId, setSelectedToken, setAmount]);

  const tokenDetails = selectedChain?.tokens.find(
    (t) => t.address === selectedToken
  );

  const filteredTokens = useMemo(() => {
    if (!selectedChain || !tokenFilters) return selectedChain?.tokens;
    const chainFilter = tokenFilters.find(
      (f) => f.chainId === selectedChain.id
    );
    if (!chainFilter) return selectedChain.tokens;
    return selectedChain.tokens.filter((token) =>
      chainFilter.addresses
        .map((addr) => addr.toLowerCase())
        .includes(token.address.toLowerCase())
    );
  }, [selectedChain, tokenFilters]);

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
    isAmountValid,
    chains,
    selectedChain,
    tokenFilters,
    setTokenFilters,
    filteredTokens,
    tokenDetails,
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
