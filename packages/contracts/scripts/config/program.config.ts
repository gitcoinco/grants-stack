// Update this file any time a new program contract has been deployed
type ProgramParams = {
  programFactoryContract: string;
  programImplementationContract: string;
  programContract: string
};

type DeployParams = Record<string, ProgramParams>;

export const programParams: DeployParams = {
  "mainnet": {
    programFactoryContract: '0xe0281a20dFaCb0E179E6581c33542bC533DdC4AB',
    programImplementationContract: '0x21B0be8253DEdA0d2d8f010d06ED86093d52359b',
    programContract: '0x4fde273e009F58Aa0e5e09289242D5336FD18ad1'
  },
  "goerli": {
    programFactoryContract: '0x548c775c4Bd61d873a445ee4E769cf1A18d60eA9',
    programImplementationContract: '0x8568133fF3Ef0BD108868278Cb2a516Eaa3B8ABf',
    programContract: '0x86DceaCc03A52b7914b72eB4E10290f72BD99e68'
  },
  "optimism-mainnet": {
    programFactoryContract: '0x8918401DD47f1645fF1111D8E513c0404b84d5bB',
    programImplementationContract: '0x809E751e5C5bB1446e9ab2Ac37c687a35DE53BC6',
    programContract: '0x228907B3b4C4877885320654b98465daF62C3766'
  },
  "fantom-mainnet": {
    programFactoryContract: '0xe0281a20dFaCb0E179E6581c33542bC533DdC4AB',
    programImplementationContract: '0x21B0be8253DEdA0d2d8f010d06ED86093d52359b',
    programContract: '0x4fde273e009F58Aa0e5e09289242D5336FD18ad1'
  },
  "fantom-testnet": {
    programFactoryContract: '0xbB8f276FE1D52a38FbED8845bCefb9A23138Af92',
    programImplementationContract: '0xc76Ea06e2BC6476178e40E2B40bf5C6Bf3c40EF6',
    programContract: '0x3Cd6edA7fDF9ab6b6AF6E226Ce184569C5DF8Ae5'
  }
};