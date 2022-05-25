// Update this file with the latest deploy of
// - grantRoundImplementationContract
// - grantRoundFactoryContract
type NetworkParams = {
  grantRoundImplementationContract: string;
  grantRoundFactoryContract: string;
};

type DeployParams = Record<string, NetworkParams>;

export const params: DeployParams = {
  goerli: {
    grantRoundImplementationContract: '0xf96Ed3cc3de33002Ac1A65C6ED902C2D9a724c25', // TODO: UPDATE
    grantRoundFactoryContract: '0x191DE462AFfcD7c45db63A80756d6eEdD1a66709'  // TODO: UPDATE
  },
};