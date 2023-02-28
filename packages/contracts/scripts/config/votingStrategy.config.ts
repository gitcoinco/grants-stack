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
    implementation: '0x5030e1a81330d5098473E8d309E116C2792202eB',
    contract: '0x818A3C8F82667bd222faF84a954F35d2b0Eb6a78'
  },
  "goerli": {
    factory: '0xF741F7B6a4cb3B4869B2e2C01aB70A12575B53Ab',
    implementation: '0xcaBE5370293addA85e961bc46fE5ec6D3c6aab28',
    contract: '0xBF539cD4024Ab2140aA864ba2C6A430201b19318'
  },
  "optimism-mainnet": {
    factory: '0xE1F4A28299966686c689223Ee7803258Dbde0942',
    implementation: '0xB70aCf9654fe304CfE24ee2fA9302a987d22c31e',
    contract: '0x2D3Abb193d5118A2F96004A9316830d9E96f44Aa'
  },
  "fantom-mainnet": {
    factory: '0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38',
    implementation: '0xa71864fAd36439C50924359ECfF23Bb185FFDf21',
    contract: '0x818A3C8F82667bd222faF84a954F35d2b0Eb6a78'
  },
  "fantom-testnet": {
    factory: '0x6038fd0D126CA1D0b2eA8897a06575100f7b16C2',
    implementation: '0x1eBBf0FC753e03f13Db456A3686523Fc589E4f67',
    contract: '0x02B52C3a398567AdFffb3396d6eE3d3c2bff37fE'
  }
};