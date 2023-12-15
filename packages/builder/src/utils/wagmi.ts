import {
  connectorsForWallets,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient } from "wagmi";
import { getEnabledChainsAndProviders } from "./chains";

const { chains: enabledChains, providers: enabledProviders } =
  getEnabledChainsAndProviders();

export const { chains, provider } = configureChains(
  enabledChains,
  enabledProviders
);

/** We perform environment variable verification at buildtime, so all process.env properties are guaranteed to be strings */
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID as string;

const { wallets } = getDefaultWallets({
  appName: "Gitcoin Builder",
  projectId,
  chains,
});

const connectors = connectorsForWallets([
  {
    ...wallets,
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains, projectId }),
      coinbaseWallet({ appName: "Gitcoin Builder", chains }),
      metaMaskWallet({ chains, projectId }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default wagmiClient;
