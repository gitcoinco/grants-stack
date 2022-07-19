// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programImplementationContract: string;
  programFactoryContract: string;
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  "goerli": {
    programImplementationContract: '0x6D4F03Eb1a51f16da40E4237C42DE07D96C8e351',
    programFactoryContract: '0xAd732aB847d20EdfC48A6d9B256f35D756381C52'
  },
  "optimism-mainnet": {
    programImplementationContract: '',
    programFactoryContract: ''
  },
  "optimism-kovan": {
    programImplementationContract: '0x6038fd0D126CA1D0b2eA8897a06575100f7b16C2',
    programFactoryContract: '0xb19589C32351EC32652BAb386b61443b741B678a'
  }
};