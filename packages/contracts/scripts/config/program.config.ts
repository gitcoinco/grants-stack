// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programFactoryContract: string;
  programImplementationContract: string;
  programContract: string
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  "goerli": {
    programFactoryContract: '0x79c2394B20A809EA693a7D64323A8846FF02029c',
    programImplementationContract: '0x36570Ae6e66f8dcFcEAe94D2247AF7B07119CFc3',
    programContract: '0x6c0368003C44dD7f30ecb94219961Aaf252F6222'
  },
  "optimism-mainnet": {
    programFactoryContract: '0xB3Ee4800c93cBec7eD2a31050161240e4663Ff5E',
    programImplementationContract: '0xED42e0f4391Fa24E579B16191F6Eb41f934c3B1c',
    programContract: '0x378cEB3dEb7a80ec1579bfd61EE1EFB76Fc63025'
  }
};