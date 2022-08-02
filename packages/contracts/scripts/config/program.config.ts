// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programFactoryContract: string;
  programImplementationContract: string;
  programContract: string
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  "goerli": {
    programFactoryContract: '0x30875E085D988fAbadf3B5aE117061D607167f02',
    programImplementationContract: '0xd5dE70B96e145925905D0267FdF65bAa03a8681c',
    programContract: '0x51184b429edBcDc5CA5f60c69467A45D50E2C482'
  },
  "optimism-mainnet": {
    programFactoryContract: '',
    programImplementationContract: '',
    programContract: ''
  },
  "optimism-kovan": {
    programFactoryContract: '',
    programImplementationContract: '',
    programContract: ''
  }
};