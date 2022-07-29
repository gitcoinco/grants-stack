import {
  createClient,
  configureChains,
  chain
} from "wagmi"

import { publicProvider } from "wagmi/providers/public"
import { infuraProvider } from "wagmi/providers/infura"

import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const { chains, provider, webSocketProvider } = configureChains(
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

export const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Gitcoin Round Manager',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
})