// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programImplementationContract: string;
  programFactoryContract: string;
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  goerli: {
    programImplementationContract: '0x7492612F252eAb2c93E9FfDd4Bea47c2C70f3479',
    programFactoryContract: '0xCB08d3a6cAe32443873537D502b22270C77e27e1'
  },
};