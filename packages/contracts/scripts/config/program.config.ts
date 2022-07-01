// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programImplementationContract: string;
  programFactoryContract: string;
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  goerli: {
    programImplementationContract: '0x01B8c38730a8830eE280e9Cc000b66ce3b45221E',
    programFactoryContract: '0x7b7a95DE5cdBDA7F4B4604CC3F14Da3085dC6a52'
  },
};