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
    roundFactoryContract: '0x2aD4797E384aa31b5aEf7801C368C3B97e3D8197',
    roundImplementationContract: '0x6632Bb1dfe27FdD7F70DD85c5F240aBfe153D3bE',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1',
    roundContract: '0xaF0B0869c5EF9317dd0f9c40b36E4fc91Dd16e30'
  },
};