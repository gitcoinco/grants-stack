import { getConfig } from "common/src/config";
import { allNetworks, mainnetNetworks } from "common/src/chains";
import { Chain } from "@rainbow-me/rainbowkit";

const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development" ? allNetworks : mainnetNetworks;

export function getEnabledChainsAndProviders() {
  const config = getConfig();
  const chains: Chain[] = [];

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
      ? chainsOverride.split(",").map((id) => id.trim())
      : [];

  if (selectedChainsNames.length > 0) {
    // if REACT_APP_CHAINS_OVERRIDE is specified we use those
    selectedChainsNames.forEach((id) => {
      const chain = allChains.find((c) => c.id === Number(id));
      if (chain === undefined) {
        throw new Error(`allChains doesn't contain a chain with id "${id}"`);
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
  return { chains };
}
