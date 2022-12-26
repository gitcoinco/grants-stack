// Update this file any time a new QF voting contract has been deployed
type QFVotingParams = {
  factory: string;
  implementation: string;
  contract: string
};

type DeployParams = Record<string, QFVotingParams>;

export const QFVotingParams: DeployParams = {
  "mainnet": {
    factory: '0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38',
    implementation: '0x114885035DAF6f8E09BE55Ed2169d41A512dad45',
    contract: '0x818A3C8F82667bd222faF84a954F35d2b0Eb6a78'
  },
  "goerli": {
    factory: '0xF741F7B6a4cb3B4869B2e2C01aB70A12575B53Ab',
    implementation: '0x64f0f2F6Ed6bF8Db5dc391588120c8328DD8F41a',
    contract: '0x1a497D28890EfB320D04F534Fa6318B6A0657619'
  },
  "optimism-mainnet": {
    factory: '0xE1F4A28299966686c689223Ee7803258Dbde0942',
    implementation: '0x5987A30F7Cb138c231de96Fe1522Fe4f1e83940D',
    contract: '0x2D3Abb193d5118A2F96004A9316830d9E96f44Aa'
  },
  "fantom-mainnet": {
    factory: '0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38',
    implementation: '0x114885035DAF6f8E09BE55Ed2169d41A512dad45',
    contract: '0x818A3C8F82667bd222faF84a954F35d2b0Eb6a78'
  },
  "fantom-testnet": {
    factory: '0x6038fd0D126CA1D0b2eA8897a06575100f7b16C2',
    implementation: '0x4ba9Ed9C90d955FD92687d9aB49deFcCa3C3a959',
    contract: '0x02B52C3a398567AdFffb3396d6eE3d3c2bff37fE'
  }
};