// Update this file any time a new Payout Strategy contract has been added
type PayoutStrategies = {
  merklePayoutContract?: string;
};

type DeployParams = Record<string, PayoutStrategies>;

export const PayoutParams: DeployParams = {
  mainnet: {
    merklePayoutContract: "0xC068C0EAF90533D3817a1782847eAA6719ABB6c7",
  },
  goerli: {
    merklePayoutContract: "0xEC041ea461a59B355671CC1F87c904519375A6FD",
  },
  "optimism-mainnet": {
    merklePayoutContract: "0x835A581472Ce6a1f1108d9484567a2162C9959C8",
  },
  "fantom-mainnet": {
    merklePayoutContract: "0xB5CF3fFD3BDfC6A124aa9dD96fE14118Ed8083e5",
  },
  "fantom-testnet": {
    merklePayoutContract: "0xcaC94621584a1a0121c0B5664A9FFB0B86588B8a",
  },
  "polygon-mumbai": {
    merklePayoutContract: "0xb04f69d8b4e300d566813a9b62f5d7878a0322c3",
  },
};
