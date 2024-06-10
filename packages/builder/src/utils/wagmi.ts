import { QueryClient } from "@tanstack/react-query";
import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";

import { getEnabledChainsAndProviders } from "./chains";

const { chains: enabledChains } = getEnabledChainsAndProviders();

/** We perform environment variable verification at buildtime, so all process.env properties are guaranteed to be strings */
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID as string;

export const config = getDefaultConfig({
  appName: "Gitcoin Builder",
  projectId,
  chains: [...enabledChains] as [Chain, ...Chain[]],
});

const queryClient = new QueryClient();

export default queryClient;
