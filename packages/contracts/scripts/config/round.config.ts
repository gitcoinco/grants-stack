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
    roundFactoryContract: '0xfF187f3d58c9E1eB4d7177a8009C26ac79efC534',
    roundImplementationContract: '0x979F0770E8B235b0996cF73b26eFDb77B8E086B2',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1',
    roundContract: '0x7581e65b04da761ef3311997ec04bf3046013c96'
  },
};