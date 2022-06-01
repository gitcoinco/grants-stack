// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programImplementationContract: string;
  programFactoryContract: string;
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  goerli: {
    programImplementationContract: '0x585F25C3c2Eb15a32C54E3Aa24361B371206129C',
    programFactoryContract: '0xc2A3EB8b0aaFd6119a47AFa729722D300C94e48b'
  },
};