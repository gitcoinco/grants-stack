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
    bulkVoteContract: '0x868CBca73915f842A70cD9584D80a57DB5E690C1'
  },
};