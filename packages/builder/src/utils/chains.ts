import { Chain } from "@rainbow-me/rainbowkit";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { getConfig } from "common/src/config";
import { allNetworks, mainnetNetworks } from "common/src/chains";

const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development" ? allNetworks : mainnetNetworks;

export function getEnabledChainsAndProviders() {
  const config = getConfig();
  const chains: Chain[] = [];
  const providers = [publicProvider({ priority: 2 })];

  const {
    blockchain: { chainsOverride },
  } = config;
  const selectedChainsNames =
    chainsOverride !== undefined &&
    chainsOverride.trim() !== "" &&
    // FIXME: now that we are validating config vars with zod, we allow optional vars.
    // Until we finalize the global configuration we leave chainsOverride in prod set as "-"
    // to make the verify-env task passing.
    // When we finish the refactoring to use the global config everywhere, we can change the way we
    // verify the env vars
    chainsOverride !== "-"
      ? chainsOverride.split(",").map((name) => name.trim())
      : [];

  if (selectedChainsNames.length > 0) {
    // if REACT_APP_CHAINS_OVERRIDE is specified we use those
    selectedChainsNames.forEach((name) => {
      const chain = allChains.find((c) => c.network === name);
      if (chain === undefined) {
        throw new Error(`allChains doesn't contain a chain called "${name}"`);
      }

      chains.push(chain);
    });
  } else if (config.appEnv === "production") {
    // if REACT_APP_CHAINS_OVERRIDE is not specified  ans we are in production
    // we use the default chains for production environments
    chains.push(...mainnetNetworks);
  } else {
    // if REACT_APP_CHAINS_OVERRIDE is not specified we use the
    // default chains for staging
    chains.push(...allNetworks);
  }

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

  return { chains, providers };
}
