import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient } from "@tanstack/react-query";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { getEnabledChains } from "./chainConfig";
import {
  createWalletClient,
  createPublicClient,
  custom,
  Chain,
  http,
} from "viem";
// import { mainnet, sepolia } from "viem/chains";

// export const { chains, publicClient, webSocketPublicClient } = configureChains(
//   getEnabledChains(),
//  // [publicProvider(), infuraProvider(), alchemyProvider()]
// );

export const chains: [Chain, ...Chain[]] = getEnabledChains();

/** We perform environment variable verification at buildtime, so all process.env properties are guaranteed to be strings */
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID as string;

export const queryClient = new QueryClient();

// const { wallets } = getDefaultWallets({
//   appName: "Grant Explorer",
//   projectId,
//   chains,
// });

// const connectors = connectorsForWallets([...wallets]);

export const config = getDefaultConfig({
  appName: "Grants Explorer",
  projectId,
  chains: [...chains],
  // todo: add transports for each chain
  transports: [],
});

export const walletClient = (chain: Chain) =>
  createWalletClient({
    // hoist the account if we have it
    // account: account,
    chain: chain,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    transport: custom(window.ethereum!),
  });

export const publicClient = (chain: Chain) =>
  createPublicClient({ chain: chain, transport: http() });
