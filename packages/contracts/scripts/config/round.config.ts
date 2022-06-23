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
    roundFactoryContract: '0x391d32CDcDD7DaBF42f9B50c6E177a106d8114C5',
    roundImplementationContract: '0x89EDA61A3a4431f1BD9A2A4277758E822839A719',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1',
    roundContract: '0x5b824852C437Ef23F591EfAe965589C0D6d757F0'
  },
};