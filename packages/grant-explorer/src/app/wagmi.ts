import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient } from "@tanstack/react-query";
import { Chain as RChain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { allNetworks, mainnetNetworks } from "common/src/chains";
import { getClient, getConnectorClient } from "@wagmi/core";
import { providers } from "ethers";
import { type Account, type Chain, type Client, type Transport } from "viem";
import { Connector } from "wagmi";

const allChains: RChain[] =
  process.env.REACT_APP_ENV === "development" ? allNetworks : mainnetNetworks;

/* TODO: remove hardcoded value once we have environment variables validation */
const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";

export const config = getDefaultConfig({
  appName: "Gitcoin Explorer",
  projectId,
  chains: [...allChains] as [Chain, ...Chain[]],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

const queryClient = new QueryClient();

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback")
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    );
  return new providers.JsonRpcProvider(transport.url, network);
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getEthersProvider(chainId: number) {
  const client = getClient(config, { chainId });
  if (!client) return;
  return clientToProvider(client);
}

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Action to convert a Viem Client to an ethers.js Signer. */
export async function getEthersSigner(connector: Connector, chainId: number) {
  const client = await getConnectorClient(config, { chainId, connector });
  return clientToSigner(client);
}

export default queryClient;
