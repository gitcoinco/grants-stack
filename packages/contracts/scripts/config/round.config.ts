// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  bulkVotingStrategyContract: string;
  roundContract ?: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  "goerli": {
    roundFactoryContract: '0x294e4D13919602f3B857fB2195628Fd5255e298a',
    roundImplementationContract: '0x1BCeaad09525783DEFeD6A827625823F7b8d0485',
    bulkVotingStrategyContract: '0x1a78d5d69fB09255368dE41d3b1f47219A3EC3a4',
    roundContract: '0xB91FeC0b68f39cbfdd75E4f08042c60724e1bd3b'
  },
  "optimism-mainnet": {
    roundFactoryContract: '',
    roundImplementationContract: '',
    bulkVotingStrategyContract: '',
    roundContract: ''
  },
  "optimism-kovan": {
    roundFactoryContract: '',
    roundImplementationContract: '',
    bulkVotingStrategyContract: '',
    roundContract: ''
  },
};