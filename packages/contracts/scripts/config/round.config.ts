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
    roundFactoryContract: '0x515594eeB37A6D5815F4c860454cD4FD87539978',
    roundImplementationContract: '0x1D88549dF4A5880d5d459eBf84330bdC2b3Ee647',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1',
    roundContract: '0x707F12906E028dE672424d600c9C69460dcD2295'
  },
  "optimism-mainnet": {
    roundFactoryContract: '',
    roundImplementationContract: '',
    bulkVotingStrategyContract: '',
    roundContract: ''
  },
  "optimism-kovan": {
    roundFactoryContract: '0xbB8f276FE1D52a38FbED8845bCefb9A23138Af92',
    roundImplementationContract: '0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6',
    bulkVotingStrategyContract: '0x2D39988C462C63b0035c3824fDEE80938cB27d0b',
    roundContract: '0x3Cd6edA7fDF9ab6b6AF6E226Ce184569C5DF8Ae5'
  },
};