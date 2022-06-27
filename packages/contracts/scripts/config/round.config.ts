// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  bulkVotingStrategyContract: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  goerli: {
    roundImplementationContract: '0xB2f9ab12B0295ED8955fB1648D835Ed285973CF1',
    roundFactoryContract: '0xADC2c41972385d42646D8E08b673DF33e7cb5d02',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1'
  },
};