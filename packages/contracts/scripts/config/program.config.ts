// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programImplementationContract: string;
  programFactoryContract: string;
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  goerli: {
    programImplementationContract: '0x6D4F03Eb1a51f16da40E4237C42DE07D96C8e351',
    programFactoryContract: '0xAd732aB847d20EdfC48A6d9B256f35D756381C52'
  },
};