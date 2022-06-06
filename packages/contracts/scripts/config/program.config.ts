// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programImplementationContract: string;
  programFactoryContract: string;
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  goerli: {
    programImplementationContract: '0x54457339Ca7Cc674f035ed2456d68631672733b7',
    programFactoryContract: '0x0EbD2E2130b73107d0C45fF2E16c93E7e2e10e3a'
  },
};