// Update this file any time a new contract has been deployed
type NetworkParams = {
  grantRoundImplementationContract: string;
  grantRoundFactoryContract: string;
  bulkVoteContract: string;
};

type DeployParams = Record<string, NetworkParams>;

// Any timr
export const params: DeployParams = {
  goerli: {
    grantRoundImplementationContract: '0xf96Ed3cc3de33002Ac1A65C6ED902C2D9a724c25',
    grantRoundFactoryContract: '0x191DE462AFfcD7c45db63A80756d6eEdD1a66709',
    bulkVoteContract: '0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6'
  },
};