// Update this file any time a new Payout Strategy contract has been added
type PayoutStrategies = {
  merklePayoutContract ?: string
};

type DeployParams = Record<string, PayoutStrategies>;

export const PayoutParams: DeployParams = {
  "goerli": {
    merklePayoutContract: '0x62b3CE47829777db4ec4dd3d9FF268168C562547'
  },
  "optimism-mainnet": {
    merklePayoutContract: ''
  }
};