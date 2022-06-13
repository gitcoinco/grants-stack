// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  bulkVoteContract: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  goerli: {
    roundImplementationContract: '0x74052bED315C145567E56A022A3D89EfE7deeb1d',
    roundFactoryContract: '0x8CECC7587d9bC7db93f5a797c90264b6048cc590',
    bulkVoteContract: '0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6'
  },
};