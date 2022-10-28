// Update this file any time a new QF voting contract has been deployed
type QFVotingParams = {
  factory: string;
  implementation: string;
  contract: string
};

type DeployParams = Record<string, QFVotingParams>;

export const QFVotingParams: DeployParams = {
  "goerli": {
    factory: '0xF741F7B6a4cb3B4869B2e2C01aB70A12575B53Ab',
    implementation: '0xfdEAf531f04fd7C6de3938e2069beE83aBadFe08',
    contract: '0xeBd0f5D44d2c5517ED7dC8c2F1C18dCf97BA02Ac'
  },
  "optimism-mainnet": {
    factory: '',
    implementation: '',
    contract: ''
  },
  "fantom-testnet": {
    factory: '0x6038fd0D126CA1D0b2eA8897a06575100f7b16C2',
    implementation: '0x4ba9Ed9C90d955FD92687d9aB49deFcCa3C3a959',
    contract: '0x02B52C3a398567AdFffb3396d6eE3d3c2bff37fE'
  }
};