import {
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  base,
  celo,
  celoAlfajores,
  fantom,
  fantomTestnet,
  lukso,
  mainnet,
  optimism,
  pgn,
  pgnTestnet,
  polygon,
  polygonMumbai,
  scroll,
  sepolia,
  zkSync,
  zkSyncSepoliaTestnet,
} from "viem/chains";

export enum ChainId {
  MAINNET = mainnet.id,
  OPTIMISM_MAINNET_CHAIN_ID = optimism.id,
  FANTOM_MAINNET_CHAIN_ID = fantom.id,
  FANTOM_TESTNET_CHAIN_ID = fantomTestnet.id,
  ZKSYNC_ERA_TESTNET_CHAIN_ID = zkSyncSepoliaTestnet.id,
  ZKSYNC_ERA_MAINNET_CHAIN_ID = zkSync.id,
  PGN = pgn.id,
  PGN_TESTNET = pgnTestnet.id,
  ARBITRUM = arbitrum.id,
  ARBITRUM_GOERLI = arbitrumGoerli.id,
  AVALANCHE = avalanche.id,
  FUJI = avalancheFuji.id,
  POLYGON = polygon.id,
  POLYGON_MUMBAI = polygonMumbai.id,
  BASE = base.id,
  SCROLL = scroll.id,
  DEV1 = 313371,
  DEV2 = 313372,
  SEPOLIA = sepolia.id,
  SEI_DEVNET = 713715,
  LUKSO = lukso.id,
  LUKSO_TESTNET = 4201,
  CELO = celo.id,
  CELO_ALFAJORES = celoAlfajores.id,
}

// see: https://github.com/redstone-finance/redstone-node/blob/main/src/config/tokens.json
// export const RedstoneTokenIds = {
//   FTM: "FTM",
//   USDC: "USDC",
//   DAI: "DAI",
//   ETH: "ETH",
//   ARB: "ARB",
//   BUSD: "BUSD",
//   GTC: "GTC",
//   MATIC: "MATIC",
//   AVAX: "AVAX",
//   CVP: "CVP",
//   USDT: "USDT",
//   LUSD: "LUSD",
//   MUTE: "MUTE",
//   mkUSD: "mkUSD",
//   DATA: "DATA",
//   USDGLO: "USDGLO",
//   SEI: "SEI",
//   OP: "OP",
//   LYX: "LYX",
//   CELO: "CELO",
//   CUSD: "CUSD",
// } as const;
