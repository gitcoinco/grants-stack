import "@rainbow-me/rainbowkit/styles.css"

import { getDefaultWallets } from "@rainbow-me/rainbowkit"

import {
  createClient,
  configureChains,
  chain
} from "wagmi"

import { publicProvider } from "wagmi/providers/public"
import { infuraProvider } from "wagmi/providers/infura"

export const { chains, provider, webSocketProvider } = configureChains(
  [
    chain.goerli,
    chain.optimismKovan,
    chain.optimism
  ],
  [
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_ID }),
    publicProvider()
  ],
)

const { connectors } = getDefaultWallets({
  appName: 'Gitcoin Round Manager',
  chains
})

export const client = createClient({
  autoConnect: true,
  connectors: connectors,
  provider,
  webSocketProvider,
})