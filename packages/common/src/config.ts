import { getEnv } from "./env";

type PinataConfig = {
  jwt: string;
  gateway: string;
  pinataBaseUrl: string;
};

export function loadPinataConfig(): PinataConfig {
  // we use ! since they these vars are required by default
  // and an exception will be thrown inside getEnv if they are empty
  return {
    jwt: getEnv("REACT_APP_PINATA_JWT")!,
    gateway: getEnv("REACT_APP_IPFS_BASE_URL")!,
    pinataBaseUrl: getEnv("REACT_APP_PINATA_BASE_URL")!,
  };
}
