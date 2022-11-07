// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  roundContract ?: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  "goerli": {
    roundFactoryContract: '0x5770b7a57BD252FC4bB28c9a70C9572aE6400E48',
    roundImplementationContract: '0x0fF5962Bc56BA0Cf6D7d6EF90df274AE5dC4D16A',
    roundContract: '0xcEF1772Dd6764C95f14c26B25e8f012C072C5F77'
  },
  "optimism-mainnet": {
    roundFactoryContract: '',
    roundImplementationContract: '',
    roundContract: ''
  },
  "fantom-mainnet": {
    roundFactoryContract: '0x3e7f72DFeDF6ba1BcBFE77A94a752C529Bb4429E',
    roundImplementationContract: '0xC2B0d8dAdB88100d8509534BB8B5778d1901037d',
    roundContract: '0x866485759ABC95c36FA77B216A5AdbA4275a14aB'
  },
  "fantom-testnet": {
    roundFactoryContract: '0x00F51ba2Cd201F4bFac0090F450de0992a838762',
    roundImplementationContract: '0x635E69237C0428861EC8c5D8083e9616022c89Ea',
    roundContract: '0xd3E45c78050a6472e28b9E02AA8596F7868e63d6'
  }
};