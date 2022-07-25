// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programImplementationContract: string;
  programFactoryContract: string;
  programContract: string
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  "goerli": {
    programImplementationContract: '0xc63D4e75eb6B1564994558bE71D082fC795265aB',
    programFactoryContract: '0x9F7caF160E9674BbF7159eb302c350680Ac09eF6',
    programContract: '0x843157f3668722485Fd189111a4df0A9c20c59f4'
  },
  "optimism-mainnet": {
    programImplementationContract: '',
    programFactoryContract: '',
    programContract: ''
  },
  "optimism-kovan": {
    programImplementationContract: '0x4A910609A85523e08C74Fe3a35a61F1afF40bd83',
    programFactoryContract: '0x21AE9Cd37c5981841Be9f0168Ee8dBCeb67bcCC2',
    programContract: '0x4a3dA6496F6f938477d41EcEd227780F9bF5501C'
  }
};