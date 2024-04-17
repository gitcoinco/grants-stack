import { ChainId, RedstoneTokenIds } from "./chain-ids";
import { ethers } from "ethers";
import { Address } from "wagmi";

export type PayoutToken = {
  name: string;
  chainId: number;
  address: Address;
  logo?: string;
  default?: boolean; // TODO: this is only used to provide the initial placeholder item, look for better solution
  redstoneTokenId?: string;
  decimal: number;
};
export const TokenNamesAndLogos = {
  FTM: "/logos/fantom-logo.svg",
  BUSD: "/logos/busd-logo.svg",
  DAI: "/logos/dai-logo.svg",
  USDC: "./logos/usdc-logo.svg",
  ETH: "/logos/ethereum-eth-logo.svg",
  OP: "/logos/optimism-logo.svg",
  ARB: "/logos/arb-logo.svg",
  GCV: "/logos/gcv.svg",
  GTC: "/logos/gtc.svg",
  AVAX: "/logos/avax-logo.svg",
  MATIC: "/logos/pol-logo.svg",
  CVP: "/logos/power-pool.png", // PowerPool
  TEST: "/logos/dai-logo.svg",
  USDT: "/logos/usdt-logo.svg",
  LUSD: "/logos/lusd-logo.svg",
  MUTE: "/logos/mute-logo.svg",
  mkUSD: "/logos/mkusd-logo.svg", // Prisma mkUSD
  USDGLO: "/logos/usdglo-logo.svg",
  SEI: "/logos/sei.png",
} as const;
const MAINNET_TOKENS: PayoutToken[] = [
  {
    name: "DAI",
    chainId: ChainId.MAINNET,
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "ETH",
    chainId: ChainId.MAINNET,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "CVP",
    chainId: ChainId.MAINNET,
    address: "0x38e4adB44ef08F22F5B5b76A8f0c2d0dCbE7DcA1",
    decimal: 18,
    logo: TokenNamesAndLogos["CVP"],
    redstoneTokenId: RedstoneTokenIds["CVP"],
  },
  {
    name: "mkUSD",
    chainId: ChainId.MAINNET,
    address: "0x4591DBfF62656E7859Afe5e45f6f47D3669fBB28",
    decimal: 18,
    logo: TokenNamesAndLogos["mkUSD"],
    redstoneTokenId: RedstoneTokenIds["mkUSD"],
  },
];

const SEPOLIA_TOKENS: PayoutToken[] = [
  {
    name: "ETH",
    chainId: ChainId.SEPOLIA,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "DAI",
    chainId: ChainId.SEPOLIA,
    address: "0xa9dd7983B57E1865024d27110bAB098B66087e8F",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "USDC",
    chainId: ChainId.SEPOLIA,
    address: "0x78e0D07C4A08adFfe610113310163b40E7e47e81",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
  },
];

const OPTIMISM_MAINNET_TOKENS: PayoutToken[] = [
  {
    name: "DAI",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "ETH",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "USDGLO",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3",
    decimal: 18,
    logo: TokenNamesAndLogos["USDGLO"],
    redstoneTokenId: RedstoneTokenIds["USDGLO"],
  },
];
const FANTOM_MAINNET_TOKENS: PayoutToken[] = [
  {
    name: "WFTM",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    decimal: 18,
    logo: TokenNamesAndLogos["FTM"],
    redstoneTokenId: RedstoneTokenIds["FTM"],
  },
  {
    name: "FTM",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["FTM"],
    redstoneTokenId: RedstoneTokenIds["FTM"],
  },
  {
    name: "BUSD",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
    decimal: 18,
    logo: TokenNamesAndLogos["BUSD"],
    redstoneTokenId: RedstoneTokenIds["BUSD"],
  },
  {
    name: "DAI",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "GcV",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x83791638da5EB2fAa432aff1c65fbA47c5D29510",
    decimal: 18,
    logo: TokenNamesAndLogos["GCV"],
    redstoneTokenId: RedstoneTokenIds["DAI"], // We use DAI for the price
  },
];
const FANTOM_TESTNET_TOKENS: PayoutToken[] = [
  {
    name: "DAI",
    chainId: ChainId.FANTOM_TESTNET_CHAIN_ID,
    address: "0xEdE59D58d9B8061Ff7D22E629AB2afa01af496f4",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "FTM",
    chainId: ChainId.FANTOM_TESTNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["FTM"],
    redstoneTokenId: RedstoneTokenIds["FTM"],
  },
];

const ZKSYNC_ERA_TESTNET_TOKENS: PayoutToken[] = [
  {
    name: "ETH",
    chainId: ChainId.ZKSYNC_ERA_TESTNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "TEST",
    chainId: ChainId.ZKSYNC_ERA_TESTNET_CHAIN_ID,
    address: "0x8fd03Cd97Da068CC242Ab7551Dc4100DD405E8c7",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
];

const ZKSYNC_ERA_MAINNET_TOKENS: PayoutToken[] = [
  {
    name: "ETH",
    chainId: ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "DAI",
    chainId: ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID,
    address: "0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "USDT",
    chainId: ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID,
    address: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
    decimal: 6,
    logo: TokenNamesAndLogos["USDT"],
    redstoneTokenId: RedstoneTokenIds["USDT"],
  },
  {
    name: "LUSD",
    chainId: ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID,
    address: "0x503234F203fC7Eb888EEC8513210612a43Cf6115",
    decimal: 18,
    logo: TokenNamesAndLogos["LUSD"],
    redstoneTokenId: RedstoneTokenIds["LUSD"],
  },
  {
    name: "MUTE",
    chainId: ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID,
    address: "0x0e97C7a0F8B2C9885C8ac9fC6136e829CbC21d42",
    decimal: 18,
    logo: TokenNamesAndLogos["MUTE"],
    redstoneTokenId: RedstoneTokenIds["MUTE"],
  },
];

const PGN_TESTNET_TOKENS: PayoutToken[] = [
  {
    name: "TEST",
    chainId: ChainId.PGN_TESTNET,
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    logo: TokenNamesAndLogos["DAI"],
    decimal: 18,
  },
  {
    name: "ETH",
    chainId: ChainId.PGN_TESTNET,
    address: ethers.constants.AddressZero,
    logo: TokenNamesAndLogos["ETH"],
    decimal: 18,
  },
];
const PGN_MAINNET_TOKENS: PayoutToken[] = [
  {
    name: "ETH",
    chainId: ChainId.PGN,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "GTC",
    chainId: ChainId.PGN,
    address: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
    decimal: 18,
    logo: TokenNamesAndLogos["GTC"],
    redstoneTokenId: RedstoneTokenIds["GTC"],
  },
  {
    name: "DAI",
    chainId: ChainId.PGN,
    address: "0x6C121674ba6736644A7e73A8741407fE8a5eE5BA",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
];

const BASE_TOKENS: PayoutToken[] = [
  {
    name: "ETH",
    chainId: ChainId.BASE,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "USDC",
    chainId: ChainId.BASE,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
  },
];

const ARBITRUM_GOERLI_TOKENS: PayoutToken[] = [
  {
    name: "ETH",
    chainId: ChainId.ARBITRUM_GOERLI,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
];
const ARBITRUM_TOKENS: PayoutToken[] = [
  {
    name: "ETH",
    chainId: ChainId.ARBITRUM,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "USDC",
    chainId: ChainId.ARBITRUM,
    address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
  },
  {
    name: "ARB",
    chainId: ChainId.ARBITRUM,
    address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    decimal: 18,
    logo: TokenNamesAndLogos["ARB"],
    redstoneTokenId: RedstoneTokenIds["ARB"],
  },
  {
    name: "USDGLO",
    chainId: ChainId.ARBITRUM,
    address: "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3",
    decimal: 18,
    logo: TokenNamesAndLogos["USDGLO"],
    redstoneTokenId: RedstoneTokenIds["USDGLO"],
  },
  {
    name: "GTC",
    chainId: ChainId.ARBITRUM,
    address: "0x7f9a7db853ca816b9a138aee3380ef34c437dee0",
    decimal: 18,
    logo: TokenNamesAndLogos["GTC"],
    redstoneTokenId: RedstoneTokenIds["GTC"],
  },
];
const AVALANCHE_TOKENS: PayoutToken[] = [
  {
    name: "AVAX",
    chainId: ChainId.AVALANCHE,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["AVAX"],
    redstoneTokenId: RedstoneTokenIds["AVAX"],
  },
  {
    name: "USDC",
    chainId: ChainId.AVALANCHE,
    address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
  },
];
const FUJI_TOKENS: PayoutToken[] = [
  {
    name: "AVAX",
    chainId: ChainId.FUJI,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["AVAX"],
    redstoneTokenId: RedstoneTokenIds["AVAX"],
  },
  {
    name: "USDC",
    chainId: ChainId.FUJI,
    address: "0x5425890298aed601595a70ab815c96711a31bc65",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
  },
];
const POLYGON_TOKENS: PayoutToken[] = [
  {
    name: "MATIC",
    chainId: ChainId.POLYGON,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["MATIC"],
    redstoneTokenId: RedstoneTokenIds["MATIC"],
  },
  {
    name: "USDC",
    chainId: ChainId.POLYGON,
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
  },
  {
    name: "USDGLO",
    chainId: ChainId.POLYGON,
    address: "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3",
    decimal: 18,
    logo: TokenNamesAndLogos["USDGLO"],
    redstoneTokenId: RedstoneTokenIds["USDGLO"],
  },
];
const POLYGON_MUMBAI_TOKENS: PayoutToken[] = [
  {
    name: "MATIC",
    chainId: ChainId.POLYGON_MUMBAI,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["MATIC"],
    redstoneTokenId: RedstoneTokenIds["MATIC"],
  },
  {
    name: "USDC",
    chainId: ChainId.POLYGON_MUMBAI,
    address: "0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
  },
];

const SCROLL_TOKENS: PayoutToken[] = [
  {
    name: "ETH",
    chainId: ChainId.SCROLL,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
  {
    name: "USDC",
    chainId: ChainId.SCROLL,
    address: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
  },
];

const SEI_TOKENS: PayoutToken[] = [
  {
    name: "SEI",
    chainId: ChainId.SEI_DEVNET,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["SEI"],
    redstoneTokenId: RedstoneTokenIds["SEI"],
  },
];

export const payoutTokens = [
  ...MAINNET_TOKENS,
  ...OPTIMISM_MAINNET_TOKENS,
  ...FANTOM_MAINNET_TOKENS,
  ...FANTOM_TESTNET_TOKENS,
  ...PGN_TESTNET_TOKENS,
  ...PGN_MAINNET_TOKENS,
  ...ARBITRUM_TOKENS,
  ...ARBITRUM_GOERLI_TOKENS,
  ...AVALANCHE_TOKENS,
  ...FUJI_TOKENS,
  ...POLYGON_TOKENS,
  ...POLYGON_MUMBAI_TOKENS,
  ...ZKSYNC_ERA_MAINNET_TOKENS,
  ...ZKSYNC_ERA_TESTNET_TOKENS,
  ...BASE_TOKENS,
  ...SEPOLIA_TOKENS,
  ...SCROLL_TOKENS,
  ...SEI_TOKENS,
];

export const getPayoutTokenOptions = (chainId: ChainId): PayoutToken[] => {
  const tokens = payoutTokens.filter((token) => token.chainId === chainId);
  return tokens.length > 0 ? tokens : MAINNET_TOKENS;
};
