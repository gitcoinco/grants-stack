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
    programFactoryContract: '0xea8b324E1099Ca0f82e8f50b2C2019eA1A2BA011',
    programImplementationContract: '0x6D86bDA37651F486bDac067c9c20eD512E8f93B3',
    programContract: '0x007c9A1a6F239923E4f7C0e30C5DE4c2100B22D6'
  }
};