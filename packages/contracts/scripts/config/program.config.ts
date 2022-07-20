// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programImplementationContract: string;
  programFactoryContract: string;
  programContract: string
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  "goerli": {
    programImplementationContract: '0x6D4F03Eb1a51f16da40E4237C42DE07D96C8e351',
    programFactoryContract: '0xAd732aB847d20EdfC48A6d9B256f35D756381C52',
    programContract: '0xA758560ED04c45FE77D1bE3aFC1f8B0eb4Cc597c'
  },
  "optimism-mainnet": {
    programImplementationContract: '',
    programFactoryContract: '',
    programContract: ''
  },
  "optimism-kovan": {
    programImplementationContract: '0x6038fd0D126CA1D0b2eA8897a06575100f7b16C2',
    programFactoryContract: '0xb19589C32351EC32652BAb386b61443b741B678a',
    programContract: '0x857e76d3E83f087c7BA18d03A8d7488fbE52DA1B'
  }
};