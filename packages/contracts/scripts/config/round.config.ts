// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  bulkVotingStrategyContract: string;
  roundContract ?: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  goerli: {
    roundFactoryContract: '0x515594eeB37A6D5815F4c860454cD4FD87539978',
    roundImplementationContract: '0x1D88549dF4A5880d5d459eBf84330bdC2b3Ee647',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1',
    roundContract: '0x707F12906E028dE672424d600c9C69460dcD2295'
  },
};