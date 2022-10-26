// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programFactoryContract: string;
  programImplementationContract: string;
  programContract: string
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  "goerli": {
    programFactoryContract: '0x548c775c4Bd61d873a445ee4E769cf1A18d60eA9',
    programImplementationContract: '0x8568133fF3Ef0BD108868278Cb2a516Eaa3B8ABf',
    programContract: '0x86DceaCc03A52b7914b72eB4E10290f72BD99e68'
  },
  "optimism-mainnet": {
    programFactoryContract: '0xB3Ee4800c93cBec7eD2a31050161240e4663Ff5E',
    programImplementationContract: '0xED42e0f4391Fa24E579B16191F6Eb41f934c3B1c',
    programContract: '0x378cEB3dEb7a80ec1579bfd61EE1EFB76Fc63025'
  }
};