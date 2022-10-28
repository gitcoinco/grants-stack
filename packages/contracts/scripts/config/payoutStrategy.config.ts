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
  },
  "fantom-testnet": {
    merklePayoutContract: '0xcaC94621584a1a0121c0B5664A9FFB0B86588B8a'
  }
};