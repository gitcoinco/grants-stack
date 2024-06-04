import "@rainbow-me/rainbowkit/styles.css";
import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createClient, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { getConfig } from "common/src/config";
import { allNetworks, mainnetNetworks } from "common/src/chains";

const config = getConfig();

const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development" ? allNetworks : mainnetNetworks;

/* TODO: remove hardcoded value once we have environment variables validation */
const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";

const providers = [publicProvider({ priority: 2 })];
if (config.blockchain.infuraId !== undefined) {
  providers.push(
    infuraProvider({ apiKey: config.blockchain.infuraId!, priority: 0 })
  );
}

if (config.blockchain.alchemyId !== undefined) {
  providers.push(
    alchemyProvider({ apiKey: config.blockchain.alchemyId!, priority: 1 })
  );
}

export const { chains, provider, webSocketProvider } = configureChains(
  allChains,
  providers
);

// Custom wallet connectors: more can be added by going here:
// https://www.rainbowkit.com/docs/custom-wallet-list
const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains, projectId }),
      metaMaskWallet({ chains, projectId }),
      coinbaseWallet({ appName: "Gitcoin Round Manager", chains }),
    ],
  },
]);

export const client = createClient({
  autoConnect: true,
  connectors: connectors,
  provider,
  webSocketProvider,
});
