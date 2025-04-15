import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { getBalance } from "@wagmi/core";
import { config } from "../../app/wagmi";
import { NATIVE, getChains, TChain, TToken, getChainById } from "common";
import { useAccount } from "wagmi";
import { Hex, zeroAddress } from "viem";

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
  directAllocationPoolId: number | null;
  tokenBalances: {
    [chainId: number]: {
      [address: string]: number;
    };
  };
  selectedTokenBalance: number;
  tokenFilters?: TokenFilter[];
  chains: TChain[];
  selectedChain: TChain | null;
  filteredTokens?: TToken[];
  tokenDetails: TToken | undefined;
  amountInWei: bigint;
  setIsEnabled: (enabled: boolean) => void;
  setSelectedChainId: (chainId: number | null) => void;
  setSelectedToken: (token: string) => void;
  setAmount: (amount: string) => void;
  setTokenFilters: (filters: TokenFilter[]) => void;
  setAmountInWei: (amount: bigint) => void;
};

export const GITCOIN_RECIPIENT_CONFIG: {
  [chainId: number]: {
    nonce: bigint;
    recipient: Hex;
  };
} = {
  42220: {
    // Celo
    nonce: 10000n,
    recipient: "0x6a02e9bdAd1C5B8cBbC3B200F0aaE67496FFd4d4",
  },
  42161: {
    // Arbitrum One
    nonce: 10000n,
    recipient: "0x6a02e9bdAd1C5B8cBbC3B200F0aaE67496FFd4d4",
  },
  10: {
    // Optimism
    nonce: 10000n,
    recipient: "0x6a02e9bdAd1C5B8cBbC3B200F0aaE67496FFd4d4",
  },
  8453: {
    // Base
    nonce: 10000n,
    recipient: "0x6a02e9bdAd1C5B8cBbC3B200F0aaE67496FFd4d4",
  },
};

export const getGitcoinRecipientData = (
  chainId: number
): {
  nonce: bigint;
  recipient: Hex;
} => {
  const config = GITCOIN_RECIPIENT_CONFIG[chainId];
  if (!config) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return config;
};

const DonateToGitcoinContext = createContext<DonateToGitcoinContextType | null>(
  null
);

export function DonateToGitcoinProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("0.00");
  const [directAllocationPoolId, setDirectAllocationPoolId] = useState<
    number | null
  >(null);
  const [tokenBalances, setTokenBalances] = useState<{
    [chainId: number]: {
      [address: Hex]: number;
    };
  }>({});
  const { address } = useAccount();

  const [tokenFilters, setTokenFilters] = useState<TokenFilter[] | undefined>(
    undefined
  );

  const [amountInWei, setAmountInWei] = useState<bigint>(0n);

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
      selectedChainId && selectedToken
        ? tokenBalances[selectedChainId]?.[selectedToken as Hex] || 0
        : 0,
    [tokenBalances, selectedChainId, selectedToken]
  );

  useEffect(() => {
    if (!address || !tokenFilters) return;

    const fetchBalances = async () => {
      const balancesMap: { [chainId: number]: { [address: string]: number } } =
        {};

      // Process each chain's token filters
      await Promise.all(
        tokenFilters.map(async ({ chainId, addresses }) => {
          const chain = getChainById(chainId);
          if (!chain) return;

          balancesMap[chainId] = {};

          // Fetch balances for filtered tokens
          const tokenBalances = await Promise.all(
            addresses.map(async (tokenAddress) => {
              const token = chain.tokens.find(
                (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
              );
              if (!token) return null;

              const { value } = await getBalance(config, {
                address,
                token:
                  tokenAddress.toLowerCase() === NATIVE.toLowerCase() ||
                  tokenAddress.toLowerCase() === zeroAddress.toLowerCase()
                    ? undefined
                    : (tokenAddress.toLowerCase() as Hex),
                chainId,
              });

              return {
                address:
                  tokenAddress.toLowerCase() === NATIVE.toLowerCase() ||
                  tokenAddress.toLowerCase() === zeroAddress.toLowerCase()
                    ? zeroAddress
                    : tokenAddress,
                balance: Number(value) / 10 ** (token.decimals || 18),
              };
            })
          );

          // Add valid balances to the map
          tokenBalances.forEach((result) => {
            if (result) {
              balancesMap[chainId][result.address] = result.balance;
            }
          });
        })
      );

      setTokenBalances(balancesMap);
    };

    fetchBalances();
  }, [address, tokenFilters]);

  useEffect(() => {
    if (tokenFilters) {
      const hasGitcoinSupportedChain = tokenFilters.some((filter) =>
        Object.keys(GITCOIN_RECIPIENT_CONFIG).includes(
          filter.chainId.toString()
        )
      );
      setIsEnabled(hasGitcoinSupportedChain);
    }
  }, [tokenFilters]);

  useEffect(() => {
    if (!isEnabled) {
      setSelectedChainId(null);
      setSelectedToken("");
      setAmount("");
    }
  }, [isEnabled, setSelectedChainId, setSelectedToken, setAmount]);

  useEffect(() => {
    if (!selectedChainId) return;
    const fetchDirectAllocationPoolId = async () => {
      const poolId =
        getChainById(selectedChainId).contracts.directAllocationPoolId;
      setDirectAllocationPoolId(poolId ?? null);
    };
    fetchDirectAllocationPoolId();
  }, [selectedChainId]);

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
    directAllocationPoolId,
    tokenBalances,
    selectedTokenBalance,
    chains,
    selectedChain,
    tokenFilters,
    filteredTokens,
    tokenDetails,
    amountInWei,
    setTokenFilters,
    setIsEnabled,
    setSelectedChainId,
    setSelectedToken,
    setAmount,
    setAmountInWei,
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
