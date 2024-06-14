import { AlloVersion } from "data-layer/dist/data-layer.types";
import { z } from "zod";

const trueStrings = ["1", "t", "T", "TRUE", "true", "True"];

// remove after this PR is merged: https://github.com/colinhacks/zod/pull/2989
function parseStringToBoolean(value: string) {
  if (trueStrings.includes(value)) {
    return true;
  }

  return false;
}

export type Config = {
  appEnv: "development" | "test" | "production";
  ipfs: {
    baseUrl: string;
  };
  dataLayer: {
    searchServiceBaseUrl: string;
    gsIndexerEndpoint: string;
  };
  pinata: {
    jwt: string;
    baseUrl: string;
  };
  blockchain: {
    chainsOverride: string | undefined;
    alchemyId: string | undefined;
    infuraId: string | undefined;
  };
  explorer: {
    disableEstimates: boolean;
  };
  manager: {
    disableDirectGrantsForAlloV2: boolean;
  };
  allo: {
    version: AlloVersion;
  };
  passport: {
    passportCommunityId: string;
    passportAPIKey: string;
    passportAvalancheCommunityId: string;
    passportAvalancheAPIKey: string;
  };
};

type LocalStorageConfigOverrides = Record<string, string>;

let config: Config | null = null;

function getLocalStorageConfigOverrides(): LocalStorageConfigOverrides {
  if (typeof window === "undefined") {
    return {};
  }

  const configOverrides =
    window.localStorage.getItem("configOverrides") || "{}";
  return JSON.parse(configOverrides);
}

export function switchAlloVersionAndReloadPage(version: AlloVersion) {
  const currentAlloVersion = getConfig().allo.version;

  if (currentAlloVersion === version) {
    return;
  }

  setLocalStorageConfigOverride("allo-version", version);
  window.location.reload();
}

export function setLocalStorageConfigOverride(key: string, value: string) {
  if (typeof window === "undefined") {
    throw new Error("window is not defined");
  }

  const configOverrides = getLocalStorageConfigOverrides();

  configOverrides[key] = value;
  window.localStorage.setItem(
    "configOverrides",
    JSON.stringify(configOverrides)
  );
}

function overrideConfigFromLocalStorage(config: Config): Config {
  const configOverrides = getLocalStorageConfigOverrides();

  const alloVersion = z
    .enum(["allo-v1", "allo-v2"])
    .catch(() => config.allo.version)
    .parse(configOverrides["allo-version"]);

  return {
    ...config,
    allo: {
      ...config.allo,
      version: alloVersion,
    },
  };
}

// listen for allo version changes in other tabs
if (typeof window !== "undefined") {
  const currentAlloVersion = getAlloVersion();
  window.addEventListener("storage", () => {
    const newAlloVersion = getAlloVersion({ reload: true });
    if (currentAlloVersion !== newAlloVersion) {
      window.location.reload();
    }
  });
}

export function getAlloVersion(opts?: { reload: boolean }): AlloVersion {
  return getConfig(opts).allo.version;
}

export function getConfig(
  opts: { reload: boolean } = { reload: false }
): Config {
  if (config !== null && !opts?.reload) {
    return config;
  }

  const hostnameAlloVersion =
    typeof window !== "undefined" &&
    window.location.hostname === "explorer-v1.gitcoin.co"
      ? "allo-v1"
      : undefined;

  config = {
    appEnv: z
      .enum(["development", "test", "production"])
      .default("development")
      .parse(process.env.REACT_APP_ENV),
    ipfs: {
      baseUrl: z
        .string()
        .url()
        .default("https://local-ipfs.dev")
        .parse(process.env.REACT_APP_IPFS_BASE_URL),
    },
    dataLayer: {
      searchServiceBaseUrl: z
        .string()
        .url()
        .parse(process.env.REACT_APP_GRANTS_STACK_SEARCH_API_BASE_URL),
      gsIndexerEndpoint: z
        .string()
        .url()
        .default("http://localhost:4000")
        .parse(process.env.REACT_APP_INDEXER_V2_API_URL),
    },
    pinata: {
      jwt: z.string().min(1).parse(process.env.REACT_APP_PINATA_JWT),
      baseUrl: z.string().url().parse(process.env.REACT_APP_PINATA_BASE_URL),
    },
    blockchain: {
      chainsOverride: z
        .string()
        .optional()
        .parse(process.env.REACT_APP_CHAINS_OVERRIDE),
      alchemyId: z.string().optional().parse(process.env.REACT_APP_ALCHEMY_ID),
      infuraId: z.string().optional().parse(process.env.REACT_APP_INFURA_ID),
    },
    explorer: {
      disableEstimates: parseStringToBoolean(
        z
          .string()
          .optional()
          .default("false")
          .parse(process.env.REACT_APP_EXPLORER_DISABLE_MATCHING_ESTIMATES)
      ),
    },
    allo: {
      version: z
        .enum(["allo-v1", "allo-v2"])
        .default("allo-v2")
        .parse(hostnameAlloVersion ?? process.env.REACT_APP_ALLO_VERSION),
    },
    manager: {
      disableDirectGrantsForAlloV2: config?.allo.version === "allo-v1",
    },
    passport: {
      passportCommunityId: z
        .string()
        .parse(process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID),
      passportAPIKey: z
        .string()
        .default("")
        .refine((value) => {
          if (process.env.NODE_ENV === "production" && value.length === 0) {
            return false;
          }

          return true;
        }, "Passport API key is required in production")
        .parse(process.env.REACT_APP_PASSPORT_API_KEY),
      passportAvalancheCommunityId: z
        .string()
        .parse(process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID_AVALANCHE),
      passportAvalancheAPIKey: z
        .string()
        .default("")
        .refine((value) => {
          if (process.env.NODE_ENV === "production" && value.length === 0) {
            return false;
          }

          return true;
        }, "Passport Avalanche API key is required in production")
        .parse(process.env.REACT_APP_PASSPORT_AVALANCHE_API_KEY),
    },
  };

  config = overrideConfigFromLocalStorage(config);

  return config;
}
