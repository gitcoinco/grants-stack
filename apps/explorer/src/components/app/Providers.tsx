"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { PropsWithChildren } from "react";
import { Config, WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem/chains";
import * as wagmiChains from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { getChains } from "@gitcoin/gitcoin-chain-data";

export const supportedChains = getChains();

export const chains = Object.values(wagmiChains).filter((chain) =>
  supportedChains.map((c) => c.id).includes(chain.id)
) as unknown as [Chain, ...Chain[]];

const defaultConfig = getDefaultConfig({
  appName: "Allo Kit",
  projectId: "ffa6468a2accec2f1e59502fae10c166",
  chains,
  ssr: true,
});

/*
Our default Web3Provider is RainbowKit + Wagmi + Gitcoin supported chains.

It is possible for apps to use their own implementation. 
However, Wagmi is currently a requirement because of hooks. 

*/
export function Web3Provider({
  children,
  config = defaultConfig,
}: PropsWithChildren<{ config?: Config }>) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
