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
    roundFactoryContract: '0x592b8983f02cF41bBAa3Bb39920E5498Bd9cD938',
    roundImplementationContract: '0x4A173c7f9AD7cE6E176362cFc67F4101dAdedd45',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1',
    roundContract: '0xaF0B0869c5EF9317dd0f9c40b36E4fc91Dd16e30'
  },
};