import { z } from "zod";

type Config = {
  ipfs: {
    baseUrl: string;
  };
  pinata: {
    jwt: string;
    baseUrl: string;
  };
};

var config: Config | null = null;

function getEnv(
  name: string,
  opts: { allowEmpty: boolean } = { allowEmpty: false }
) {
  const min = opts.allowEmpty ? 0 : 1;
  return z
    .string({
      required_error: `env var ${name} is required`,
    })
    .min(min)
    .parse(name);
}

export function getConfig(): Config {
  if (config !== null) {
    return config;
  }

  config = {
    ipfs: {
      baseUrl: getEnv("REACT_APP_IPFS_BASE_URL"),
    },
    pinata: {
      jwt: getEnv("REACT_APP_PINATA_JWT"),
      baseUrl: getEnv("REACT_APP_PINATA_BASE_URL"),
    },
  };

  return config;
}
