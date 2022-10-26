// Update this file any time a new Payout Strategy contract has been added
type PayoutStrategies = {
  merklePayoutContract ?: string
};

type DeployParams = Record<string, PayoutStrategies>;

export const PayoutParams: DeployParams = {
  "goerli": {
    merklePayoutContract: '0x4A68275B53165d9209Ec3f535a331A3f0160d6FF'
  },
  "optimism-mainnet": {
    merklePayoutContract: ''
  }
};