// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  roundContract ?: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  "goerli": {
    roundFactoryContract: '0x89f01CD69087669f8e49F6FB8aD475F622Ac8791',
    roundImplementationContract: '0x2707e86cBb3Db85b1Ceb78bA9C9580e2F35736fD',
    roundContract: '0x8140b7168d6acBf528FC68Ea94D75E9d2B5aF721'
  },
  "optimism-mainnet": {
    roundFactoryContract: '0x64ab6F2E11dF8B3Be5c8838eDe3951AC928daE9C',
    roundImplementationContract: '0xdf25423c9ec15347197Aa5D3a41c2ebE27587D59',
    roundContract: '0x2DF6c42dd2d7a13c19Ca5f7858fB7cC05A2933ed'
  }
};