// Update this file any time a new contract has been deployed
type RoundParams = {
  grantRoundImplementationContract: string;
  grantRoundFactoryContract: string;
  bulkVoteContract: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  goerli: {
    grantRoundImplementationContract: '0x85387A953d83A149a4f378FA47011C7b6F93d851',
    grantRoundFactoryContract: '0xC4012787FD2242657C19F006D38c55859F0Ca508',
    bulkVoteContract: '0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6'
  },
};