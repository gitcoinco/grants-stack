export enum ChainId {
  MAINNET = 1,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
  FANTOM_MAINNET_CHAIN_ID = 250,
  FANTOM_TESTNET_CHAIN_ID = 4002,
  ZKSYNC_ERA_TESTNET_CHAIN_ID = 300,
  ZKSYNC_ERA_MAINNET_CHAIN_ID = 324,
  PGN = 424,
  PGN_TESTNET = 58008,
  ARBITRUM = 42161,
  ARBITRUM_GOERLI = 421613,
  AVALANCHE = 43114,
  FUJI = 43113,
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  BASE = 8453,
  SCROLL = 534352,
  DEV1 = 313371,
  DEV2 = 313372,
  SEPOLIA = 11155111,
  SEI_DEVNET = 713715,
  LUKSO = 42,
  LUKSO_TESTNET = 4201,
  CELO = 42220,
  CELO_ALFAJORES = 44787,
}

export const RedstoneTokenIds = {
  FTM: "FTM",
  USDC: "USDC",
  DAI: "DAI",
  ETH: "ETH",
  ARB: "ARB",
  BUSD: "BUSD",
  GTC: "GTC",
  MATIC: "MATIC",
  AVAX: "AVAX",
  CVP: "CVP",
  USDT: "USDT",
  LUSD: "LUSD",
  MUTE: "MUTE",
  mkUSD: "mkUSD",
  DATA: "DATA",
  USDGLO: "USDGLO",
  SEI: "SEI",
  OP: "OP",
  LYX: "LYX",
  CELO: "CELO",
} as const;
