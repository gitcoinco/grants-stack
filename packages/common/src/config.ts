import { z } from "zod";

export type Config = {
  appEnv: "development" | "test" | "production";

  ipfs: {
    baseUrl: string;
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
};

let config: Config | null = null;

export function getConfig(): Config {
  if (config !== null) {
    return config;
  }

  config = {
    appEnv: z
      .enum(["development", "test", "production"])
      .default("development")
      .parse(process.env.REACT_APP_ENV),
    ipfs: {
      baseUrl: z.string().url().parse(process.env.REACT_APP_IPFS_BASE_URL),
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
  };

  return config;
}
