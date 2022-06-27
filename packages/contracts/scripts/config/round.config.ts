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
    roundFactoryContract: '0xE84146a78aCefF0dB44A6e260026B8febe29213c',
    roundImplementationContract: '0x22988a624824263f34880037832AF924e22C595c',
    bulkVotingStrategyContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1',
    roundContract: '0xE0770EEcCAD16CCED1ECF596f4D8C9790D8194f1'
  },
};