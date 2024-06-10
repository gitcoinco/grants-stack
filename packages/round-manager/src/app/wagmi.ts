import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient } from "@tanstack/react-query";
import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { allNetworks, mainnetNetworks } from "common/src/chains";

const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development" ? allNetworks : mainnetNetworks;

/* TODO: remove hardcoded value once we have environment variables validation */
const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";

export const config = getDefaultConfig({
  appName: "Gitcoin Manager",
  projectId,
  chains: [...allChains] as [Chain, ...Chain[]],
});

const queryClient = new QueryClient();

export default queryClient;
