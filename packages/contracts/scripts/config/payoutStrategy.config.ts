// Update this file any time a new Payout Strategy contract has been added
type MerklePayoutParams = {
  factory: string;
  implementation: string;
  contract: string;
};

type DeployParams = Record<string, MerklePayoutParams>;

export const MerklePayoutParams: DeployParams = {
  mainnet: {
    factory: "",
    implementation: "",
    contract: "",
  },
  goerli: {
    factory: "0xBb380EEEF1D33e9B993CEDbb77A6753EbA0d2F9f",
    implementation: "0x5b457B73Aa6F87FdeeDef3E408a82e803C4b67b0",
    contract: "0xB4b9f865Ee0948238AC56534cbbd8B8c45d5fC60",
  },
  "optimism-mainnet": {
    factory: "",
    implementation: "",
    contract: "",
  },
  "fantom-mainnet": {
    factory: "",
    implementation: "",
    contract: "",
  },
  "fantom-testnet": {
    factory: "",
    implementation: "",
    contract: "",
  },
};
